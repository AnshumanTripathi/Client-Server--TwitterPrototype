$(document).ready(function() {
    $('textarea').focusin(function(){
        $(this).addClass('textarea-focus');
        $(this).animate({'height':'50px'}, 500);
        $('button').removeClass('disabled');
        $('button').addClass('enabled');
    });

    $('textarea, input').click(function(event){
        event.stopPropagation();
    });
});