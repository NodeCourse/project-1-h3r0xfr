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

    $('.forward')
        .removeAttr('disabled')
        .on('click', function() {
            let answers = [];
            let total = $('.item > label').length;

            if(total < 3)
                return showError('Vous devez ajouter au moins 2 réponses.');

            $('#bottom-wizard button').hide();
            $('#bottom-wizard p').show();

            $('.item > label').each(function(index, element) {
                if(index < (total - 1)) {
                    answers.push({
                        answer: $(element).children('strong').text(),
                        description: $(element).children('span').text()
                    });
                }
            });

            let poll = {
                question: $('#question').text(),
                description: $('#description').text(),
                answers: JSON.stringify(answers)
            };

            $.ajax({
                url: '/api/poll/new',
                type: 'POST',
                dataType: 'json',
                data: poll
            }).done(function(res) {
                if(res.error) {
                    $('#bottom-wizard p').hide();
                    $('#bottom-wizard button').show();
                    return showError(res.error);
                }

                $('#form-data').val(JSON.stringify(res));
                $('#form-wizard').submit();
            });

        });
});
