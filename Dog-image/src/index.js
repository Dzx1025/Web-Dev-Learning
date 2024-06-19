import axios from "../node_modules/axios";

// form fields
const selects = document.querySelector(".breed-name");
const submit = document.querySelector(".submit");

// results
const errors = document.querySelector(".errors");
const loading = document.querySelector(".loading");
const results = document.querySelector(".result-container");

init();
const breedList = await getBreedList();
breedList.forEach((breed) => {
  const option = document.createElement("option");
  option.value = breed;
  option.text = breed;
  selects.appendChild(option);
});
submit.addEventListener("click", (e) => {
  e.preventDefault();
  const selectedBreed = selects.value;
  if (selectedBreed !== "") {
    getDogByBreed(selectedBreed);
  }
});

function init() {
  errors.textContent = "";
  loading.style.display = "none";
  results.style.display = "none";
}

async function getBreedList() {
  let breeds = [];
  try {
    await axios.get("https://dog.ceo/api/breeds/list/all").then((response) => {
      const data = response.data;
      if (data.status === "success") {
        const allBreeds = data.message;
        for (const breed in allBreeds) {
          breeds.push(breed);
        }
      } else {
        console.error("API request failed");
      }
    });
  } catch (error) {
    console.log(error);
    errors.textContent = "Sorry, we have no data for the breed list.";
  }
  return breeds;
}

function getDogByBreed(selectedBreed) {
  try {
    loading.style.display = "block";
    results.style.display = "none";
    axios
      .get(`https://dog.ceo/api/breed/${selectedBreed}/images/random`)
      .then((response) => {
        const data = response.data;
        if (data.status === "success") {
          const imageUrl = data.message;
          displayDogImage(imageUrl);
        } else {
          console.error("API request failed");
        }
      });
  } catch (error) {
    console.log(error);
    loading.style.display = "none";
    results.style.display = "none";
    errors.textContent = "Sorry, we have no data for the selected breed.";
  }
}

function displayDogImage(imageUrl) {
  const img = document.querySelector(".dog-image");
  img.src = imageUrl;

  loading.style.display = "none";
  results.style.display = "block";
}
