
function createColourScale(colour_map){
    // Define colour scale - https://github.com/d3/d3-scale/blob/main/README.md#continuous_domain
    
    // Set rectangle colour scale colours 
    d3.select('#min_stop')
        .attr('stop-color', colour_map[2])

    d3.select('#mid_stop')
        .attr('stop-color', colour_map[1])
        
    d3.select('#max_stop')
        .attr('stop-color', colour_map[0])

    return  d3.scaleDiverging()
                .domain([-1, 0, 1])
                .range(colour_map)
                .clamp(true)
}


function displayColourScale(){
    
    // Display Colour Scale
    // Update ViewBox
    d3.select('#colour_scale')
        .attr('viewBox', `0 0 160 ${d3.select('canvas').node().height}`) // divide by 2 because there are actually two maps in this 'outer' div

    // Draw Colour Scale as a rectangle (remove any existing colour scales)
    d3.select('rect')
        .remove()


    d3.select('#colour_scale')
        .append('rect')
            .attr('height', d3.select('canvas').node().height) // height of map 
            .attr('width', 40)
            .attr('x', 0)
            .attr('y', 0)
            .attr('fill', "url('#myGradient')")
            .style('stroke', 'black')
}
