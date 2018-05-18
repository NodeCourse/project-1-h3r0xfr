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
                console.log(res);
                items.each(function(index, element) {
                    $(element).text(res[index].results.length);
                });

            });
        });
});
