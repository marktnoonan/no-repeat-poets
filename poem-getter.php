<?php

mb_internal_encoding("UTF-8");

if (isset($_POST['urlForPoetryDB'])){
  $url = str_replace(' ', '%20', $_POST['urlForPoetryDB']);
  $response = file_get_contents($url);
  echo $response;
    }

else {
  $url = "http://poetrydb.org/author/Shakespeare/lines,title,linecount";
  $response = file_get_contents($url);
  echo $response;

}



 ?>
