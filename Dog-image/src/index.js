import axios from "../node_modules/axios";

// form fields


// results
const errors = document.querySelector(".errors");
const loading = document.querySelector(".loading");
const results = document.querySelector(".result-container");


async function getBreedList() {
  try {
    await axios.get("https://dog.ceo/api/breeds/list/all").then((response) => {
      const data = response.data;
      if (data.status === "success") {
        const breeds = data.message;
        for (const breed in breeds) {
          if (breeds[breed].length > 0) {
            breeds[breed].forEach((subBreed) => {
              console.log(`${subBreed} ${breed}`);
            });
          } else {
            console.log(breed);
          }
        }
      } else {
        console.error("API request failed");
      }
    });
  } catch (error) {
    console.log(error);
    loading.style.display = "none";
    results.style.display = "none";
    errors.textContent = "Sorry, we have no data for the breed list.";
  }
  
}
