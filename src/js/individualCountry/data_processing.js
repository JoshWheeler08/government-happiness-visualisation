// This code is copied and adapted from other partner's code for the homepage for use in the individual country page


const world_bank_data_path = "../data/world_bank.csv";
const happiness_data_path = "../data/WorldHappinessRaw.csv";

let filtered_world_bank_data;
let filtered_happiness_data;

// Begin to load in the datasets
let promises = [
        d3.csv(world_bank_data_path, worldBankFilter), 
        d3.csv(happiness_data_path, happinessFilter)
    ]
 
// Process data
function ready(data){

    const world_bank_data = data[0]
    const happiness_data = data[1]
    
    // Further pre-processing

    // Update dataset columns to match element columns
    world_bank_data.columns = Object.keys(world_bank_data[0])
    happiness_data.columns = Object.keys(happiness_data[0])

    // Normalise the datasets
    const normalised_world_bank_data = normaliseDataset(world_bank_data, 3) // miss out 'Country Name', 'Year' and 'Country Code'
    const normalised_happiness_data = normaliseDataset(happiness_data, 2) // miss out 'Country Name' and 'year'
    
    // Get unique countries list
    let unique_countries_happiness_data = new Set(Array.from( d3.group(normalised_happiness_data, d => d['country_name']).keys()))
    let unique_countries_world_bank_data = new Set(Array.from( d3.group(normalised_world_bank_data, d => d['country_name']).keys()))
    
    // Find intersection
    let intersection = new Set()
    for(let country_name of unique_countries_happiness_data){
        if(unique_countries_world_bank_data.has(country_name)){
            intersection.add(country_name);
        }
    }
    
    // Filter datasets for only shared country names
    filtered_world_bank_data = normalised_world_bank_data.filter( (el) => {
        return intersection.has(el['country_name'])
    });

    filtered_happiness_data = normalised_happiness_data.filter( (el) => {
        return intersection.has(el['country_name'])
    });
    // console.log(filtered_happiness_data)
    // console.log(filtered_world_bank_data)
}


// If loading the data fails
function error(error){
    console.log(error);
}