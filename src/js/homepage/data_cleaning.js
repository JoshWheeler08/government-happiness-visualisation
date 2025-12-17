
let normaliseDataset = (data, starting_elements_to_skip) => {

    scales = {}

    // ignoring country_name, code and year
    data.columns.slice(starting_elements_to_skip).forEach((column_name) => { // blocking
        
        // Find Min/Max of each column
        let columnExtent = d3.extent(data, (d) => {
            return d[column_name]
        });

        // Create scale function 
        scales[column_name] = d3.scaleLinear()
                                .range([0, 1])
                                .domain(columnExtent);
    })


    return data.map((d_record) => {

        // Apply scalers to each value in object - ignoring country_name,code and year
        Object.keys(d_record).slice(starting_elements_to_skip).forEach( (column_name) => {
            let scale = scales[column_name] 
            d_record[column_name] = scale(d_record[column_name]) 
        })

        return d_record
    })

}


let happinessFilter = (d) => {

    // Filter out any rows with missing attribute values
    if(d['Country name'] == '' || d['year'] == '' || d['Life Ladder'] == '' || d['Log GDP per capita'] == '' 
        || d['Healthy life expectancy at birth'] == '' || d['Freedom to make life choices'] == ''){
        return;
    }

    // Fix happiness dataset headers
    return {
        country_name: d['Country name'],
        year: new Date(d['year']),
        life_ladder: parseFloat(d['Life Ladder']),
        log_gdp: parseFloat(d['Log GDP per capita']),
        health_life: parseFloat(d['Healthy life expectancy at birth']),
        freedom: parseFloat(d['Freedom to make life choices'])

    }

}


let worldBankFilter = (d) => {

    // Filter out any rows with missing attribute values
    if(d['countryname'] == '' || d['code'] == '' || d['year'] == '' || d['vae'] == '' || d['pve'] == '' 
        || d['gee'] == '' || d['rqe'] == '' || d['rle'] == '' || d['cce'] == ''){
        return;
    }

    // Filter out data records not in the year range 2005-2021 (to match happiness report)
    let minimum_date = new Date('2005')
    let year_date = new Date(d['year']);
    
    if(year_date < minimum_date){
        // Date is before 2005
        return;
    }

    // Fix world bank headers and parse
    return {
        country_name: d['countryname'],
        code: d['code'],
        year: year_date,
        voice_and_accountability: parseFloat(d['vae']),
        political_stability: parseFloat(d['pve']),
        government_effectiveness: parseFloat(d['gee']),
        regulator_quality: parseFloat(d['rqe']),
        rule_of_law: parseFloat(d['rle']),
        control_of_corruption: parseFloat(d['cce']),
    }

}
