<?php
  $ID = $_GET["userid"];
  $url1 = "https://www.roblox.com/avatar-thumbnail-3d/json?userId=" . $ID;
  $rbx1 = curl_init($url1);
  $geturl2 = file_get_contents($url1);
  $jsond = json_decode($geturl2);
  $url2 = $jsond->Url;
  $gettex = file_get_contents($url2);
  $jsond2 = json_decode($gettex);
  $textures = $jsond2->textures;
  $tex1 = $textures[0];

  if(isset($_GET["r15"])){
    $tex1 = $textures[1];
  }
  header("location: hashtorbxcdn.php?hash=" . $tex1);
  echo $tex1;
  //echo $url1;
  //echo $geturl2;
  //echo $url2;
  //echo $rbx1;
 ?>
