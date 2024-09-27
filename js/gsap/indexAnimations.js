export function fadeInAnimation(view2FadeIn)
{
    $("#"+view2FadeIn+"").removeClass('hidden');
   
    var displayView = gsap.timeline();
    
    displayView.fromTo('#'+view2FadeIn+'',{opacity:0}, { duration: 0.25,opacity:1})
}

export function growAnimation(view2display)
{
    $("#"+view2display+"").removeClass('hidden');
   
    var displayView = gsap.timeline();
    
    displayView
    .fromTo('#'+view2display+'',{scale:0}, { duration: 0.15,scale:1.05})
    .fromTo('#'+view2display+'',{scale:1.05}, { duration: 0.15,scale:1})
}

export function shrinkAnimation(view2hide)
{
    var hideView = gsap.timeline({
        onComplete: function() 
        {
            $("#"+view2hide+"").addClass('hidden');
        }
    });

    hideView
    .fromTo('#'+view2hide+'',{scale:1}, { duration: 0.15,scale:1.05})
    .fromTo('#'+view2hide+'',{scale:1.05}, { duration: 0.15,scale:0})
}

export function goBackAnimation(currentView, previousView)
{
    var hideView = gsap.timeline({
        onComplete: function() 
        {
            $("#"+currentView+"").addClass('hidden');

            $("#"+previousView+"").removeClass('hidden');
   
            var displayView = gsap.timeline();
            
            displayView
            .fromTo('#'+previousView+'',{scale:0}, { duration: 0.15,scale:1.05})
            .fromTo('#'+previousView+'',{scale:1.05}, { duration: 0.15,scale:1})
        }
    });

    hideView
    .fromTo('#'+currentView+'',{scale:1}, { duration: 0.15,scale:1.05})
    .fromTo('#'+currentView+'',{scale:1.05}, { duration: 0.15,scale:0})
}

export function animateTruck(run)
{
    var truckTL = gsap.timeline({ repeat: -1 });

    if (!run)
    {
        truckTL.kill();
    }else
    {
        truckTL
        .fromTo('#truck',{y:0}, { duration: 0.1,y:1.15})
        .fromTo('#truck',{y:1.15}, { duration: 0.1,y:0})
    }
}
