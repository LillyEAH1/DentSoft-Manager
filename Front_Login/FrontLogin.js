document.querySelector('.toggle').addEventListener('click', function() {
    document.querySelector('.container').classList.add('active');
  });
  
  document.querySelector('.close').addEventListener('click', function() {
    document.querySelector('.container').classList.remove('active');
  });
  