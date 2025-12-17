
function setMapViewSelector(){
    // Map View Change
    d3.select('#mapViewSelector')
        .on('click', ()=> {
            
            if(mapView == 'mercator_projection'){                            
                // Update Button
                d3.select('#mapViewSelector')
                    .text('See Mercator Projection ')
                    .append('i')
                    .attr('class', 'fa fa-map')

                // Change global variable
                mapView = 'global'

                // Update Map
                createVisualisation(happiness_data_by_year.get(target_year_date), world_bank_data_by_year.get(target_year_date), colour_scale);
            }else{
                // Update Button
                d3.select('#mapViewSelector')
                    .text('See Globe View ')
                    .append('i')
                    .attr('class', 'fa fa-globe')

                // Change global variable
                mapView = 'mercator_projection'

                // Update Map
                createVisualisation(happiness_data_by_year.get(target_year_date), world_bank_data_by_year.get(target_year_date), colour_scale);
            }

        });
}
