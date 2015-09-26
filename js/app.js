function toggleSearch() {
  var $searchBar = $('.search-bar');
  $searchBar.toggleClass('hide');
  if (!$searchBar.hasClass('hide')) {
    $searchBar.find('input').focus();
  }
}

$(function() {
  $('.btn-search').on('click', function(e) {
    e.preventDefault();
    toggleSearch();
  });

  $('.search-form').submit(function(e) {
    e.preventDefault();
    var searchVal = $('.search-bar input').val();
    window.location.href = 'https://google.com/search?q=site%3Aryanlabouve.com+' + searchVal;
  });
});
