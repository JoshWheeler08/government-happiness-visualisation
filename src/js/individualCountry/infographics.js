// Check intro page text
// Read through report
// Do visualisations


function drawSmileySmile(small_x, current_h_data) {
    const svg_height = small_x * 20;
    const svg_width = d3.select("#smiley_column_div").node().getBoundingClientRect().width;
    // Calculate the smile path if we have data for this year
    // happiness offset is a value between -1 and 1. -1 results in unhappy face, 1 results in happy face
    // The life ladder value is between 0 and 10
    const happiness_offset = 6 * (current_h_data.life_ladder - 0.5);
    var points = [
        {xpoint: svg_width/2 + small_x * 3, ypoint: svg_height/2 + small_x * 2},
        {xpoint: svg_width/2, ypoint: svg_height/2 + small_x * (happiness_offset + 2)}, 
        {xpoint: svg_width/2 - small_x * 3, ypoint: svg_height/2 + small_x * 2}
    ]
    var smile = d3.line()
        .x((p) => p.xpoint)
        .y((p) => p.ypoint)
        .curve(d3.curveBasis);
    // Draw the smile
    d3.select("#smile")
        .style("visibility", "visible")
        .attr("d", smile(points))
        .attr("stroke", "black")
        .attr("fill", "none")
        .attr("stroke-width", "2%");
    
}

// Draw smiley face infographic
function drawSmileyStatic(small_x) {
    const element_size = small_x * 20;
    const element_width = d3.select("#smiley_column_div").style("width");
    // It's weirdly difficult to get the dimensions of the svg
    d3.select("#smiley_face_container")
        .attr("height", element_size)
        .attr("width", element_width)
    const svg_width = d3.select("#smiley_column_div").node().getBoundingClientRect().width;
    // Draw the yellow circle
    d3.select("#face")
        .style("fill", "yellow")
        .attr("cx", svg_width/2)
        .attr("cy", element_size/2)
        .attr("rx", small_x * 6)
        .attr("ry", small_x * 6)
        .on("mouseover", (e, d) => {
            return tooltip.style("visibility", "visible").style("left", (e.x + 10) + "px")
                .style("top", (e.y - 10) + "px").style("font-size", element_size/25 + "px")
                .text("Life Ladder infographic")
            ;})
        .on("mousemove", function(e){return tooltip.style("left", (e.x + 10) + "px").style("top", (e.y - 10) + "px");})
        .on("mouseout", function(){return tooltip.style("visibility", "hidden");})
    // Draw the left eye
    d3.select("#left_eye")
        .attr("cx", svg_width/2 + small_x * 2.2)
        .attr("cy", element_size/2 - small_x * 2)
        .attr("rx", small_x * 1.2)
        .attr("ry", small_x * 1.2)
    // Draw the right eye
    d3.select("#right_eye")
        .attr("cx", svg_width/2 - small_x * 2.2)
        .attr("cy", element_size/2 - small_x * 2)
        .attr("rx", small_x * 1.2)
        .attr("ry", small_x * 1.2)
}

// Draw effectiveness flag infographic
async function drawFlagStatic(iso) {
    const element_size = small_x * 20;
    const img_div_foreground = document.getElementById("effectiveness_flag");
    // Flags sourced from Flagpedia https://flagpedia.net/
    const flag_src = 'https://flagcdn.com/w320/' + iso.toLowerCase() + '.png'
    img_div_foreground.src = flag_src;
    d3.select("#effectiveness_flag")
        .style("width", d3.select("#effectiveness_column_div").node().getBoundingClientRect().width + "px")
        .on("mouseover", (e) => {
            return tooltip.style("visibility", "visible").style("left", (e.x + 10) + "px")
                .style("top", (e.y - 10) + "px").style("font-size", element_size/25 + "px")
                .text("Government Effectiveness infographic")
            ;})
        .on("mousemove", function(e){return tooltip.style("left", (e.x + 10) + "px").style("top", (e.y - 10) + "px");})
        .on("mouseout", function(){return tooltip.style("visibility", "hidden");});
    d3.select("#effectiveness_flag_filter")
        .on("mouseover", (e) => {
            return tooltip.style("visibility", "visible").style("left", (e.x + 10) + "px")
                .style("top", (e.y - 10) + "px").style("font-size", element_size/25 + "px")
                .text("Government Effectiveness infographic")
            ;})
        .on("mousemove", function(e){return tooltip.style("left", (e.x + 10) + "px").style("top", (e.y - 10) + "px");})
        .on("mouseout", function(){return tooltip.style("visibility", "hidden");});
}

let current_effectiveness = 0;

function storeEffectiveness(country_wb_data) {
    current_effectiveness = country_wb_data.government_effectiveness;
}

function drawFlagDynamic() {
    const flag_height = d3.select("#effectiveness_flag").node().getBoundingClientRect().height;
    const div_height = d3.select("#effectiveness_column_div").node().getBoundingClientRect().height
    const flag_offset = div_height/2 - flag_height/2;
    const grey_div_height = 1 - (current_effectiveness / 5 + 0.5);
    d3.select("#effectiveness_flag_filter")
        .style("top", flag_offset + "px")
        .style("width", d3.select("#effectiveness_column_div").node().getBoundingClientRect().width + "px")
        .style("height", d3.select('#effectiveness_flag').node().getBoundingClientRect().height * grey_div_height + "px")
    d3.select("#effectiveness_flag")
        .style("top", flag_offset + "px")
}