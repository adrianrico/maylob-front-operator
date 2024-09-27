import * as animationFunction from '/js/gsap/indexAnimations.js';

var tick
var maneuverID
var completedStepsBuffer

$( document ).ready(function() 
{
   /** - Step [1]
     *  - Load initial animations...
     */

   $('#ASLAselect').prop('disabled',true)
   $('#cargoReady').prop('disabled',true)
   $('#ready2Exit').prop('disabled',true)
   $('#modSelect').prop('disabled',true)
   $('#tramitSelect').prop('disabled',true)
   $('#unloadSiteCheck ').prop('disabled',true)   
   $('#unloadedCheck ').prop('disabled',true)   


   // Added to avoid event overwrite in DB...
   completedStepsBuffer = [false,false,false]
})





//#region [ INITIAL VIEW & DATAVIEW ]

$("#manSearch_btn").click(function() 
{
   /** - Step [1]
    *  - Get value from UI text input...
    */
   maneuverID = $('#manID_input').val().trim().toUpperCase()

   if (maneuverID.length <= 0 || maneuverID.length != 13) 
   {
      $('#errorToastPrompt').text("Debes llenar el campo.")
      $('.toast-error').css('display','grid').hide().fadeIn(200).delay(2000).fadeOut(200)   
   }else 
   {
      //LOADER..!
      $('.toast-loader').css('display','grid').hide().fadeIn(200);
      animationFunction.animateTruck(true)

      /** - Step [2]  
       *  - Search maneuver in DB by AJAX request...
       */
      $.ajax({
         url: 'http://localhost:8080/man/findManeuver',
         //url: 'https://maylob-server.onrender.com/man/findManeuver',
         type: "get",
         dataType: 'json',
         data:maneuverID,
         success : (function (data) 
         {
            if (data.message === '0') 
            {
               $('.pop-error').removeClass('hidden')
               $('.pop-error').addClass('pop-up')
               $('.pop-up').fadeIn(500)
               $('#errorText').text("⛟ MANIOBRA NO ENCONTRADA")
               $('#errorText').append("<p>🛈 Por favor revisa el ID.</p>") 
            }else
            {  
               
               let planned_date = data.foundManeuver[0].maneuver_planned_date
               
               startCounter(planned_date)

               $('#maneuverID_prompt').text(data.foundManeuver[0].maneuver_id)
               $('#maneuverDate_prompt').text(planned_date)
               $('#maneuverClient_prompt').text(data.foundManeuver[0].maneuver_customer)
               $('#maneuverSize_prompt').text(data.foundManeuver[0].maneuver_size)
               $('#maneuverType_prompt').text(data.foundManeuver[0].maneuver_type)
               $('#maneuverOrigin_prompt').text(data.foundManeuver[0].maneuver_origin)
               $('#maneuverDestination_prompt').text(data.foundManeuver[0].maneuver_destination)
               
               
               animationFunction.shrinkAnimation('initialView')
               setTimeout(function() 
               {
                  animationFunction.growAnimation('maneuverDataView')
               }, 300)
            }              
         }),
 
         error: function(serverResponse) 
         {   
             //console.log(serverResponse);
             $('#errorToastPrompt').text("⛟ Error al conectar con el servidor")
             $('.toast-error').css('display','grid').hide().fadeIn(200).delay(2000).fadeOut(200);
         },

         complete: function() 
         {
             $('.toast-loader').fadeOut(500)
             animationFunction.animateTruck(false)
         }, 
 
         //async:false
      })
   }

})


/** NAVIGATION BACKWARD */
$('#back2IV_MDV').click(function()
{
   animationFunction.goBackAnimation('maneuverDataView','initialView') 
});

/** NAVIGATION FORWARD */
$("#go2aslaView").click(function()
{ 
   stopCounter() 
   
   animationFunction.shrinkAnimation('maneuverDataView')
   setTimeout(function() 
   {
      animationFunction.growAnimation('aslaView')
   }, 300)
})
//#endregion [INITIAL VIEW & DATAVIEW]





//#region [ ASLA VIEW ]

/** - Step [1]
 *  - Update Location when checked...
 */
$('#ASLAcheck').change(function()
{      
   if ($(this).is(':checked')) 
   {
      // isChecked = $(this).val();
      if (!completedStepsBuffer[0])
      {
         updateManeuver(maneuverID,event_time_builder(),"EN ASLA","EN ESPERA")
         completedStepsBuffer[0] = true
      }          
      $('#ASLAselect').prop('disabled',false) 
   }else 
   {
       $('#ASLAselect').prop('disabled',true)
   }
});


$('#ASLAselect').change(function()
{   
   let currentStatus = $('#ASLAselect').val().trim().toUpperCase();

   updateManeuver(maneuverID,event_time_builder(),"EN ASLA",currentStatus)
     
   if (currentStatus == "LLAMADO") 
   {
      animationFunction.shrinkAnimation('aslaView')
      setTimeout(function() 
      {
         animationFunction.growAnimation('terminalView')
      }, 300)
   }
});

/** NAVIGATION BACKWARD */
$("#back2MDW_AV").click(function()
{
   animationFunction.goBackAnimation('aslaView','maneuverDataView')
})
//#endregion [ ASLA VIEW ]





//#region [ TERMINAL VIEW ]
$('#terminalLocationCheck').change(function()
{      
   if ($(this).is(':checked')) 
   {
       // isChecked = $(this).val(); 
       updateManeuver(maneuverID,event_time_builder(),"EN TERMINAL","ESPERANDO A SER CARGADO")
       $('#cargoReady').prop('disabled',false)   
   }
});

$('#cargoReady').change(function()
{      
   if ($(this).is(':checked')) 
   {
       // isChecked = $(this).val(); 
       updateManeuver(maneuverID,event_time_builder(),"EN TERMINAL","YA ESTÁ CARGADO")
       $('#ready2Exit').prop('disabled',false)   
   }
}); 

$('#ready2Exit').change(function()
{      
   if ($(this).is(':checked')) 
   {
      // isChecked = $(this).val(); 
      updateManeuver(maneuverID,event_time_builder(),"SALIENDO DE TERMINAL","ESPERANDO EN FILA PARA SALIR")
      
      animationFunction.shrinkAnimation('terminalView')
      setTimeout(function() 
      {
         animationFunction.growAnimation('fiscalView')
      }, 300)
      
   }
}); 

/** NAVIGATION BACKWARD */
$("#back2AV_TV").click(function()
{
   animationFunction.goBackAnimation('terminalView','aslaView')
})
//#endregion [ TERMINAL VIEW ]





//#region [ FISCAL VIEW ]
$('#fiscalViewCheck').change(function()
{      
   if ($(this).is(':checked')) 
   {
       // isChecked = $(this).val(); 
       updateManeuver(maneuverID,event_time_builder(),"SALIENDO DE TERMINAL","INICIANDO RUTA FISCAL")
       $('#modSelect').prop('disabled',false)   
   }else
   {
      $('#modSelect').prop('disabled',true)   
   }
});

$('#modSelect').change(function()
{   
   let currentStatus  = $('#modSelect').val().trim().toUpperCase();
   let currentStatusb = $('#tramitSelect').val().trim().toUpperCase();

   switch (currentStatus) 
   {
      case 'LIBERADO':
         updateManeuver(maneuverID,event_time_builder(),"EN RUTA FISCAL",currentStatus)

         animationFunction.shrinkAnimation('fiscalView')
         setTimeout(function() 
         {
            animationFunction.growAnimation('finalRouteView')
         }, 300)
      break;

      case 'TRAMITADOR':
         updateManeuver(maneuverID,event_time_builder(),"EN RUTA FISCAL",currentStatusb)
         $('#tramitSelect').prop('disabled',false)
      break;

      default:
         updateManeuver(maneuverID,event_time_builder(),"EN RUTA FISCAL",currentStatus)
      break;
   
   }

/*    if (currentStatus === "TRAMITADOR") 
   {
      updateManeuver(maneuverID,event_time_builder(),"EN RUTA FISCAL",currentStatusb)
      $('#tramitSelect').prop('disabled',false)
   }else
   {
      updateManeuver(maneuverID,event_time_builder(),"EN RUTA FISCAL",currentStatus)
   }

   if (currentStatus == "LIBERADO") 
   {
      updateManeuver(maneuverID,event_time_builder(),"EN RUTA FISCAL",currentStatus)

      animationFunction.shrinkAnimation('fiscalView')
      setTimeout(function() 
      {
         animationFunction.growAnimation('finalRouteView')
      }, 300)
   } */


});

$('#tramitSelect').change(function()
{   
   let currentStatus = $('#tramitSelect').val().trim().toUpperCase();

   updateManeuver(maneuverID,event_time_builder(),"EN RUTA FISCAL",currentStatus)
});

$("#back2TV_FV").click(function()
{
   animationFunction.goBackAnimation('fiscalView','terminalView')
})
 //#endregion [ FISCAL VIEW ]





 //#region [ FINAL ROUTE VIEW ]
 $('#finalRouteCheck').change(function()
 {      
    if ($(this).is(':checked')) 
    {
        // isChecked = $(this).val(); 
        updateManeuver(maneuverID,event_time_builder(),"EN RUTA A PATIO","EN CAMINO AL DESTINO")
        $('#unloadSiteCheck').prop('disabled',false)   
    }else
    {
       $('#unloadSiteCheck').prop('disabled',true)   
    }
 });

 $('#unloadSiteCheck').change(function()
 {      
    if ($(this).is(':checked')) 
    {
        // isChecked = $(this).val(); 
        updateManeuver(maneuverID,event_time_builder(),"EN PATIO","EN PROCESO DE DESCARGA")
        $('#unloadedCheck').prop('disabled',false)   
    }else
    {
       $('#unloadedCheck').prop('disabled',true)   
    }
 });

 $('#unloadedCheck').change(function()
 {      
   if ($(this).is(':checked')) 
   {
       // isChecked = $(this).val(); 
      updateManeuver(maneuverID,event_time_builder(),"EN PATIO","MANIOBRA DESCARGADA - FINALIZADA") 
      
      $('.pop-ok').removeClass('hidden')
      $('.pop-ok').addClass('pop-up')
      $('.pop-up').fadeIn(500)
      $('#okText').text("La maniobra ha finalizado.")
   }
 });

 /** NAVIGATION BACKWARD */
 $("#back2FV_FRV").click(function()
 {
    animationFunction.goBackAnimation('finalRouteView','fiscalView')
 })
//#endregion [ FINAL ROUTE VIEW ]


/** 
 * +==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+
 * +                                                                                               +
 * + [⚑] AUXILIARY FUNCTIONS                                                             +
 * +                                                                                               +
 * +==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+
 */






function event_time_builder()
{
   const dateTime = new Date

   const event_time = dateTime.getDate()
   +"-"+ dateTime.toLocaleString('default',{month:'long'}).toUpperCase()
   +"-"+ dateTime.getFullYear()
   +" "+ dateTime.getHours()
   +":"+ dateTime.getMinutes() 
   +":"+ dateTime.getSeconds()

   return event_time
}

function startCounter(rawDate)
{

   var limitDay = new Date (rawDate).getTime()

   tick = setInterval(function()
   {  
      var now = new Date().getTime();
      
      var distance = limitDay - now
      
      var days    = Math.floor(distance / (1000 * 60 * 60 * 24));
      var hours   = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      var seconds = Math.floor((distance % (1000 * 60)) / 1000);

      var resultString = days+"DÍA(S) "
      +hours+"HRS "
      +minutes+"MINS "
      +seconds+"SEG"
   
      $('#counter').text(resultString)

      if(distance <= 0) clearInterval(tick)

   }, 1000)

}

function stopCounter()
{
   clearInterval(tick)
}

function updateManeuver(id2update,eventTime,location2update,status2update)
{
   /** - Step [1]
    *  - Prepare data to be sent...
    */
   let percentage = ""
   switch(status2update)
   {
      case 'EN ESPERA':
         percentage = "10%"
      break;

      case 'LLAMADO':
         percentage = "20%"
      break;

      case 'ESPERANDO A SER CARGADO':
         percentage = "30%"
      break;

      case 'YA ESTÁ CARGADO':
         percentage = "40%"
      break;

      case 'ESPERANDO EN FILA PARA SALIR':
         percentage = "50%"
      break;

      case 'INICIANDO RUTA FISCAL':
         percentage = "60%"
      break;

      case 'LIBERADO':
         percentage = "70%"
      break;

      case 'EN CAMINO AL DESTINO':
         percentage = "80%"
      break;

      case 'EN PROCESO DE DESCARGA':
         percentage = "90%"
      break;

      case 'MANIOBRA DESCARGADA - FINALIZADA':
         percentage = "100%"
      break;

      default:
         percentage = "-"
      break
   }

    var data2update = 
    {
         'maneuver_id':id2update,
         'maneuver_event_time':""+eventTime+"",
         'maneuver_current_location':""+location2update+"",
         'maneuver_current_status':""+status2update+"",
         'maneuver_completion':""+percentage+""
    }

    $.ajax({
        url: 'http://localhost:8080/man/updateManeuver/',
        //url: 'https://maylob-server.onrender.com/man/updateManeuver/'+id2update,
        type: "patch",
        dataType: 'json',
        data:data2update,
        success : (function (data) 
        {
             console.log(data)
             
            /*
            if (data.message == 0) 
            {
                //1.1
                var toast = $("#toast_warning");
                var prompt = $(".prompt")
                prompt.text("¡ID ya registrado!")
                toast.fadeIn(200).delay(2000).fadeOut(200);
            }else
            {
                //2.1
                var toast = $("#toast_ok");
                var prompt = $(".prompt")
                prompt.text("¡Equipo guardado!")
                toast.fadeIn(200).delay(2000).fadeOut(200);
            } */


        })
    }).fail( function(serverResponse) 
    {   
        console.log(serverResponse.responseJSON)
        
        console.log('error');
        /* //1.1
        var toast = $("#toast_error");
        var prompt = $(".prompt")
        prompt.text("¡Error en el SERVER!")
        toast.fadeIn(200).delay(2000).fadeOut(200); */
    })   
}


/** Use to validate that no value is empty... 
 * @param {*} fieldValue 
 * @returns true if valid
 */
function validateField(fieldValue)
{
    //console.log(fieldValue);
    if (fieldValue == undefined || fieldValue == "") 
    {
        return false
    }else
    {
        return true
    }          
}

/**POP-UP */
$('#closeError').click(function()
{
    $('.pop-up').fadeOut(500);
    $('.pop-error').removeClass('pop-up')
    $('.pop-error').addClass('hidden')
})

/**POP-UP */
$('#closeOK').click(function()
{   
   $('.pop-up').fadeOut(500);
   $('.pop-ok').removeClass('pop-up')
   $('.pop-ok').addClass('hidden')

   animationFunction.goBackAnimation('finalRouteView','initialView')
})
