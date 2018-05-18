$(document).ready(function() {
    let clipboard = new ClipboardJS('#copy');
    clipboard.on('success', function(e) {
        showSuccess('Lien copié.');
    });
});
