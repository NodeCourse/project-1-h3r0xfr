$('.submit')
    .removeAttr('disabled')
    .show()
    .on('click', function(e) {
        $('form').submit();
    });
