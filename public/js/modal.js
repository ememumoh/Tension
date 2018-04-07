$(document).ready(function(){
  $('.article-modal-open').on('click', function(){
    $('.article-modal').addClass('active')
  });
  $('.article-modal-close').on('click', function(){
    $('.article-modal').removeClass('active');
  });
});