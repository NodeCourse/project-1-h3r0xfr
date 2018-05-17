$(document).ready(function() {
    $.fn.editable.defaults.mode = 'inline';
    $('#question').editable();
    $('#description').editable();

    $('#add_answer').on('click', function() {
        let parent = $(this).parent();
        let el = parent.clone().insertBefore(parent).hide().fadeIn('fast');
        let item = el.children();
        let answer = item.children();

        item.removeAttr('id');
        item.prepend('<div class="delete_answer" style="padding:10px;position:absolute;z-index:1;font-size:18px;cursor:pointer;"><i class="icon-trash"></i></div>');

        item.children('.delete_answer').on('click', function() {
            $(this).parent().parent().fadeOut('fast', function() {
                $(this).remove();
            });
        });

        answer.children('strong').text('Réponse').editable();
        answer.children('span').text('Description').editable();
    });
});
