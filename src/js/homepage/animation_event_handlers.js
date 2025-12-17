
function setAnimationBackBtn(){        
    // On Backwards Button Click
    d3.select(`#back_btn`)
        .on('click', () => {

            if(target_year <= MIN_YEAR){
                // Can't go back any further
                return;
            }else{
                target_year -= 1;
                target_year_date = new Date(target_year.toString())
                createVisualisation(happiness_data_by_year.get(target_year_date), world_bank_data_by_year.get(target_year_date), colour_scale);

                // Update target year
                d3.select('#current_year')
                    .text(target_year);
            }

            // Disable button after click for 2 seconds to prevent spamming (can mess up the map)
            d3.selectAll('.animation_btns')
                .attr('disabled', true);
            });

}


function setAnimationForwardButton(){
    // On Forward Button Click
    d3.select(`#forward_btn`)
        .on('click', forwardbtnLogic);
}


function forwardbtnLogic(){
    if(target_year >= MAX_YEAR){
        // Can't go forward anymore
        return;
    }else{
        target_year += 1;
        target_year_date = new Date(target_year.toString())
        createVisualisation(happiness_data_by_year.get(target_year_date), world_bank_data_by_year.get(target_year_date), colour_scale);

        // Update target year
        d3.select('#current_year')
            .text(target_year);
    }
    
    // Disable button after click for 2 seconds to prevent spamming (can mess up the map)
    d3.selectAll('.animation_btns')
        .attr('disabled', true);
}


function resetAnimation(){
    // Stop timer
    animation_timer.stop()

    // Change button html back
    d3.select('#animate_btn')
        .html(' Start Animation ')

    // Re-enable forward and back buttons
    d3.selectAll('.animation_btns')
        .attr('disabled', null);
}


// Performs the map animation by recursively calling itself using a timer until MAX_YEAR reached
function performAnimation(){
    animation_timer = d3.timeout(() => {
            forwardbtnLogic()
            if(target_year < MAX_YEAR){
                // Repeat until max year is reached
                performAnimation()
            }else{
                resetAnimation()
                animation_started = false
            }
    }, 3000)
}


// Sets event handler for animation button
function setAnimationButton(){
    
    // Animation 
    d3.select('#animate_btn')
        .on('click', () => {
                                    
            if(animation_started){
                resetAnimation()
                animation_started = false

            }else{            
                if(target_year == MAX_YEAR){
                    return;
                }else{ 
                    
                    animation_started = true

                    // Change button to show stop icon
                    d3.select('#animate_btn')
                        .html('')
                        .append('i')
                        .attr('class', 'fa fa-solid fa-stop')


                    // Disable forward and back buttons
                    d3.selectAll('.animation_btns')
                        .attr('disabled', true);

                    // Perform first change immediately with click so user is waiting 3s for a response
                    forwardbtnLogic()

                    // Update map and set timer to keep updating until MAX_YEAR reached
                    performAnimation()
                }
            }
        });
} 