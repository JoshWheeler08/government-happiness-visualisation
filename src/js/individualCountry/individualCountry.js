// Global Variables

// Make screen responsive to screen size by basing units off max height/width
let small_x = 0;
let small_y = 0;

// n.b. some countries like Aruba don't have any entries in one of the datasets
const CURRENT_COUNTRY = extractSelectedCountryFromURL();

const MIN_YEAR = 2005;
const MAX_YEAR = 2021;
let selected_year = new Date(2005);

let wb_datapath = "../data/world_bank.csv";
let h_datapath = "../data/WorldHappinessRaw.csv";

// Make data global because it should only be loaded once
let country_wb_data = null;
let country_h_data = null;

// Tooltips adapted from code from https://d3-graph-gallery.com/graph/interactivity_tooltip.html
// Remove this from any function because we only need one of these
let tooltip = d3.select("body")
    .append("div")
        .style("border", "1px solid black")
        .style("position", "fixed")
        .style("z-index", "10")
        .style("visibility", "hidden")

// Sets containing the selected elements to display
let selected_per_circle = new Set();
let selected_soc_circle = new Set();

// Date picker/timeline
function attachDatePickerOnclick() {
    d3.select("#date_picker_div").style("visibility", "visible");
    const year_label = d3.select("#current_year_label");
    d3.select("#year_selector")
        .on("change", function(d) {
            selected_year = new Date(d.target.value);
            year_label.text("Current Year: " + selected_year.getFullYear());
            drawDynamicElements();
        })
    document.getElementById("year_selector").value = selected_year.getFullYear();
    year_label.text("Current Year: " + selected_year.getFullYear());
}

function drawStaticElements() {
    d3.select("body")
        .select("#country_name")
            .html(CURRENT_COUNTRY);

    drawSmileyStatic(small_x);

    drawFlagStatic(extractSelectedISOFromURL());
    
    // Draw effectiveness infographic
    d3.select("body")
        .select("#effectiveness")
            .html(CURRENT_COUNTRY);

    // draw a line chart for the selected attributes over time
    drawGraph(small_x, small_y, tooltip);
}

function hideDescriptions(hide_desc) {
    if (hide_desc) {
        d3.select("#infographic_descriptions_div").style("display", "none");
        d3.select("#s_factor_description").style("display", "none");
        d3.select("#happiness_description").style("display", "none");
        d3.select("#p_factor_description").style("display", "none");
        d3.select("#effectiveness_description").style("display", "none");

    } else {
        d3.select("#infographic_descriptions_div").style("display", "flex");
    }
}

function drawDynamicElements() {
    // Draw page
    if (country_wb_data.length && country_h_data.length > 0) {
        // Load this year's data
        const current_h_data_list = country_h_data.filter(function(h_record) {return (h_record.year.getFullYear() == selected_year.getFullYear())});
        const current_wb_data_list = country_wb_data.filter(function(wb_record) {return (wb_record.year.getFullYear() == selected_year.getFullYear())});
        const got_data = current_h_data_list.length > 0 && current_wb_data_list.length > 0;
        if (got_data) {
            d3.select("#no_data_div").style("display", "none");
            d3.select("#infographics_div").style("display", "flex");
            hideDescriptions(false);
            d3.select("#smiley_column_div").style("visibility", "visible")
            d3.select("#effectiveness_column_div").style("visibility", "visible")
            const current_h_data = current_h_data_list[0];
            const current_wb_data = current_wb_data_list[0];
            console.log("Populated datasets")
            // State the current country
            d3.select("body")
                .select("#country_name")
                    .html(CURRENT_COUNTRY);
            // Draw smiley face infographic
            drawSmileySmile(small_x, current_h_data);
            // Store current effectiveness value
            storeEffectiveness(current_wb_data);
            // Use the stored effectiveness value to draw a grey box. This is separated into a two part procedure to allow the drawFlagDynamic()
            // function to be called after the page first loads. This allows us to get the flag's size, otherwise it is 0 and on the first
            // page load this infographic doesn't work properly
            drawFlagDynamic();
            // Draw a circle chart for societal effectiveness attributes
            drawSocTreemap(small_x, current_wb_data);
            // Draw a circle chart for personal happiness attributes
            drawPerTreemap(small_x, current_h_data)
        } else {
            d3.select("#no_data_div").style("display", "block");
            d3.select("#infographics_div").style("display", "none");
            hideDescriptions(true);
            d3.select("#smiley_column_div").style("visibility", "hidden")
            d3.select("#smile").style("visibility", "hidden")
            d3.select("#effectiveness_column_div").style("visibility", "hidden")
            d3.select("#societal_factor_selector").selectAll("g").remove();
            d3.select("#personal_factor_selector").selectAll("g").remove();
        }
        
    } else {
        d3.select("body")
            .select("#country_name")
                .html("Insufficient data for " + CURRENT_COUNTRY);
    }
}

// Back button 
function back(){
    window.location.href = './homepage.html'
}

// Extracts the country selected in homepage.html from the URL path 
function extractSelectedCountryFromURL(){
    const queryString = window.location.search
    const urlParams = new URLSearchParams(queryString);
    return urlParams.get('country')
}

// Extracts the country selected in homepage.html from the URL path 
function extractSelectedISOFromURL(){
    const queryString = window.location.search
    const urlParams = new URLSearchParams(queryString);
    return urlParams.get('country_code')
}

// Setup and draw static elements which won't vary by year
async function setupPage() {
    small_x = window.innerWidth / 100;
    small_y = window.innerHeight / 100;

    // Format data
    await Promise.all(promises).then(ready, error);
    // Populates the variables
        // filtered_world_bank_data;
        // filtered_happiness_data;
    d3.select("head")
            .select("title")
                .html(CURRENT_COUNTRY);

    // Filter data for the current country
    country_wb_data = filtered_world_bank_data.filter(function(wb_record) {
            return (wb_record.country_name === CURRENT_COUNTRY);
        });
    country_h_data = filtered_happiness_data.filter(function(h_record) {
            return (h_record.country_name === CURRENT_COUNTRY);
        });
    
    if (country_wb_data.length && country_h_data.length > 0) {
        // Ensure data is sorted by year
        country_wb_data.sort(function(a, b) {
            return a.year.getFullYear() - b.year.getFullYear();
        })
        country_h_data.sort(function(a, b) {
            return a.year.getFullYear() - b.year.getFullYear();
        })
        // Set current year to the earliest year with data for the happiness report (the less complete dataset)
        selected_year = country_h_data[country_h_data.length -1].year;
        attachDatePickerOnclick();
        drawStaticElements();
        drawDynamicElements();
    } else {
        d3.select("body")
            .select("#country_name")
                .html("Insufficient data for " + CURRENT_COUNTRY);
    }
}

// How to properly round in JS - https://stackoverflow.com/questions/11832914/how-to-round-to-at-most-2-decimal-places-if-necessary
function roundTo2Dp(num){
    return Math.round((num + Number.EPSILON) * 100) / 100
}

function showHiddenAttributeTable(table_id) {
    if (d3.select("#" + table_id).style("display") == "none") {
        d3.select("#" + table_id).style("display", "block")
    } else {
        d3.select("#" + table_id).style("display", "none")
    }
}

setupPage();