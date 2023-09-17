'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Select Elements
const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

/////////////////////////////////////////////////////////////////////
class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);
  constructor(coords, duration, distance) {
    this.coords = coords;
    this.duration = duration;
    this.distance = distance;
  }
}

class Running extends Workout {
  constructor(coords, duration, distance, cadence) {
    super(coords, duration, distance);
    this.cadence = cadence;
    this.pace = this.duration / this.distance;
    this.type = 'Running';
  }
}

class Cycling extends Workout {
  constructor(coords, duration, distance, elevation) {
    super(coords, duration, distance);
    this.elevation = elevation;
    this.speed = this.distance / (this.duration / 60);
    this.type = 'Cycling';
  }
}

/////////////////////////////////////////////////////////////////////
class App {
  #currentLat;
  #currentLng;
  #map;
  #workouts = [];
  constructor() {}

  #getPosition() {
    navigator.geolocation.getCurrentPosition(
      this.#loadMap.bind(this),
      this.#handleError.bind(this)
    );
  }

  #handleError() {
    alert("Couldn't find your location");
    this.#getPosition();
  }

  #loadMap(position) {
    const coords = [position.coords.latitude, position.coords.longitude];

    this.#map = L.map('map').setView(coords, 13);

    L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on(
      'click',
      function (mapEvent) {
        this.#currentLat = mapEvent.latlng.lat;
        this.#currentLng = mapEvent.latlng.lng;
        this.#map.setView([this.#currentLat, this.#currentLng], 13);
        this.#showForm();
      }.bind(this)
    );

    this.#workouts.forEach(
      function (workout) {
        workout.date = new Date(workout.date);
        this.#renderWorkoutMarker(workout);
        this.#renderWorkoutList(workout);
      }.bind(this)
    );
  }

  #showForm() {
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  #hideForm() {
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';
    form.classList.add('hidden');
  }

  #toggleFieldType() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  #renderWorkoutMarker(workout) {
    // const workout = this.#workouts[this.#workouts.length - 1];
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 150,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type.toLowerCase()}-popup`,
          content: `${workout.type.toLowerCase() === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${
            workout.type
          } on ${months[workout.date.getMonth()]} ${workout.date.getDate()}`,
        })
      )
      .openPopup();
  }

  #renderWorkoutList(workout) {
    // const workout = this.#workouts[this.#workouts.length - 1];
    let HTML = `
    <li class="workout workout--${workout.type.toLowerCase()}" data-id="${
      workout.id
    }">
          <h2 class="workout__title">${workout.type} on ${
      months[workout.date.getMonth()]
    } ${workout.date.getDate()}</h2>
          <div class="workout__details">
            <span class="workout__icon">${
              workout.type.toLowerCase() === 'running' ? '🏃‍♂️' : '🚴‍♀️'
            }</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>`;

    if (workout.type.toLowerCase() === 'running') {
      HTML += `
      <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>`;
    } else if (workout.type.toLowerCase() === 'cycling') {
      HTML += `
      <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevation}</span>
            <span class="workout__unit">m</span>
          </div>
        </li>`;
    }
    form.insertAdjacentHTML('afterend', HTML);
  }

  #validInputs() {
    let cadence, elevation, workout;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const type = inputType.value;
    const isNumbers = (...inputs) =>
      inputs.every(input => Number.isFinite(input));
    const isPositiveNumbers = (...inputs) => inputs.every(input => input > 0);

    if (type === 'running') {
      cadence = +inputCadence.value;
      if (
        !isNumbers(distance, duration, cadence) ||
        !isPositiveNumbers(distance, duration, cadence)
      ) {
        alert('Invalid Inputs');
        return false;
      }
      workout = new Running(
        [this.#currentLat, this.#currentLng],
        duration,
        distance,
        cadence
      );
    } else if (type === 'cycling') {
      elevation = +inputElevation.value;
      if (
        !isNumbers(distance, duration, elevation) ||
        !isPositiveNumbers(distance, duration)
      ) {
        alert('Invalid Inputs');
        return false;
      }
      workout = new Cycling(
        [this.#currentLat, this.#currentLng],
        duration,
        distance,
        elevation
      );
    }
    this.#workouts.push(workout);
    return true;
  }

  #handleSubmission(e) {
    e.preventDefault();
    if (!this.#validInputs()) return;
    this.#hideForm();
    this.#renderWorkoutMarker(this.#workouts[this.#workouts.length - 1]);
    this.#renderWorkoutList(this.#workouts[this.#workouts.length - 1]);
    this.#setLocalStorage();
  }

  #moveTo(e) {
    const targetWorkout = e.target.closest('.workout');
    if (targetWorkout) {
      const targetID = e.target.closest('.workout').getAttribute('data-id');
      this.#workouts.forEach(
        function (workout) {
          if (workout.id === targetID) {
            this.#map.setView(workout.coords, 13, {
              animate: true,
              pan: { duration: 1 },
            });
          }
        }.bind(this)
      );
    }
  }

  #setLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }

  #getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('workouts'));
    if (data) {
      this.#workouts = data;
    }
  }

  run() {
    this.#getPosition();
    this.#getLocalStorage();
    form.addEventListener('submit', this.#handleSubmission.bind(this));
    inputType.addEventListener('change', this.#toggleFieldType);
    containerWorkouts.addEventListener('click', this.#moveTo.bind(this));
  }

  reset() {
    localStorage.removeItem('workouts');
    location.reload();
  }
}

const app = new App();

app.run();
