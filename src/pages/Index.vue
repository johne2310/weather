<!--suppress JSUnresolvedVariable -->
<template>
  <q-page class="flex column" :class="bgClass">
    <div class="col q-px-md">
      <q-input
        v-model="search"
        debounce="2000"
        @keyup.enter="getWeatherBySearch"
        label="Search"
        dark
        borderless
        clearable
      >
        <template v-slot:before>
          <q-icon @click="getLocation" name="my_location" />
        </template>

        <template v-slot:append>
          <q-btn @click="getWeatherBySearch" round dense flat icon="search" />
        </template>
      </q-input>
    </div>

    <template v-if="weatherData">
      <div class="col text-white text-center">
        <div class="text-h4 text-weight-light">
          {{ weatherData.name }}
        </div>
        <div class="text-h5 text-weight-light">
          {{ weatherData.weather[0].main }}
        </div>
        <div class="text-h1 text-weight-thin q-my-lg relative-position">
          <span>{{ Math.round(weatherData.main.temp) }}</span>
          <span class="text-h4 relative-position degree">
            &deg;c
          </span>
        </div>
      </div>

      <div class="col text-center">
        <img :src="imageUrl" alt="" />
      </div>
    </template>

    <template v-else>
      <div class="col column text-center text-white">
        <div class="col text-h2 text-weight-thin">
          Quasar <br />
          Weather App 7
        </div>

        <q-btn @click="getLocation" class="col" flat>
          <q-icon left size="3em" name="my_location" />
          <div>Find my location</div>
        </q-btn>
      </div>
    </template>
    <div class="col skyline"></div>
    <div v-if="progress" class="update text-grey text-caption">
      Download progress: {{ progress }}%
    </div>
  </q-page>
</template>

<script>
// const { ipcRenderer } = require('electron');
export default {
  name: 'PageIndex',
  data() {
    return {
      search: '',
      weatherData: null,
      lat: null,
      lng: null,
      apiKey: '22a195c672f8217cc53213a95c45d758',
      apiUrl: `https://api.openweathermap.org/data/2.5/weather?`,
      imageUrl: null,
      progress: '',
    };
  },
  methods: {
    getLocation() {
      this.$q.loading.show();

      if (this.$q.platform.is.electron) {
        console.log('platform is electron');
        this.$axios
          .get('https://freegeoip.app/json/')
          .then(response => {
            this.lat = response.data.latitude;
            this.lng = response.data.longitude;
            this.getWeatherByCoords();
            this.$q.loading.hide();
          })
          .catch(error => {});
      } else {
        navigator.geolocation.getCurrentPosition(position => {
          this.lat = position.coords.latitude;
          this.lng = position.coords.longitude;
          this.getWeatherByCoords();
          this.$q.loading.hide();
          // 7d65381831af695a75d20c2f3578252e
        });
      }
      // }
    },
    getWeatherByCoords() {
      this.$q.loading.show();
      this.$axios(
        `${this.apiUrl}&lat=${this.lat}&lon=${this.lng}&appid=${this.apiKey}&units=metric`
      )
        .then(response => {
          this.weatherData = response.data;
          this.imageUrl = `https://openweathermap.org/img/wn/${this.weatherData.weather[0].icon}@2x.png`;
          this.$q.loading.hide();
        })
        .catch(error => {});
    },
    getWeatherBySearch() {
      if (this.search === '') {
        return;
      } else {
        this.$q.loading.show();
        this.$axios(
          `${this.apiUrl}q=${this.search}&appid=${this.apiKey}&units=metric`
        )
          .then(response => {
            this.weatherData = response.data;
            this.imageUrl = `https://openweathermap.org/img/wn/${this.weatherData.weather[0].icon}@2x.png`;
            this.$q.loading.hide();
            this.search = '';
          })
          .catch(error => {});
      }
    },
  },
  computed: {
    // eslint-disable-next-line vue/return-in-computed-property
    bgClass() {
      if (this.weatherData) {
        if (this.weatherData.weather[0].icon.endsWith('n')) {
          return 'bg-night';
        } else {
          return 'bg-day';
        }
      }
    },
  },
  mounted() {
    // Listen for messages
    // self needed here to access the data property 'progress'
    const self = this;
    if (this.$q.platform.is.electron) {
      window.ipcRenderer.on('message', function(event, text) {
        self.progress = text;
      });
      //handle get weather menu
      window.ipcRenderer.on('weather-here', () => {
        this.getLocation();
      });
    }
  },
};
</script>

<style lang="scss">
.q-page {
  background: linear-gradient(to top, #57e01c, #066617);
}

.bg-night {
  background: linear-gradient(to top, #4a4e4e, #171718);
}

.bg-day {
  background: linear-gradient(to top, #1dbfee, #4480a3);
}

.degree {
  top: -44px;
}

.skyline {
  flex: 0 0 100px;
  background: url('../statics/skyline.png');
  background-size: contain;
  background-position: center bottom;
}
.version {
  text-align: right;
}
.body {
  box-sizing: border-box;
  margin: 0;
  padding: 20px;
  font-family: sans-serif;
  background-color: #eaeaea;
  text-align: center;
}

#notification {
  position: fixed;
  bottom: 20px;
  left: 20px;
  width: 200px;
  padding: 20px;
  border-radius: 5px;
  background-color: white;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
}
.hidden {
  display: none;
}
.update {
  z-index: 5000;
  background-color: black;
  text-align: right;
}
</style>
