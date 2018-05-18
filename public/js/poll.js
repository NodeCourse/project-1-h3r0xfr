$(document).ready(function() {
    $('.item').on('click', function() {
        $('.item').removeClass('selected');
        $(this).addClass('selected');
    });

    $('.forward')
        .removeAttr('disabled')
        .on('click', function() {
            let items = $('.item label');
            let answer = $('.selected').children('input').val();

            $.ajax({
                url: '/api/poll/' + pollId + '/answer',
                type: 'POST',
                dataType: 'json',
                data: {
                    answer: answer
                }
            }).done(function(res) {

                let total = 0;
                $.each(res, function(index, element) {
                    total += element.results.length;
                });

                $('#bottom-wizard').html('<p>' + total + ' réponses au total</p>');

                let nbAnswers = 0;
                items.each(function(index, element) {
                    nbAnswers = res[index].results.length;
                    $(element).children('p').text($(element).children('strong').text());
                    $(element).children('strong').text(((nbAnswers * 100)/total).toFixed(2) + '% (' + nbAnswers + ')');
                });

            });
        });
});
