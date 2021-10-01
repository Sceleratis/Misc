<?php
  $hash = $_GET["hash"];
  $i = 31;

  function getUTF16CodeUnits($string) {
      $string = substr(json_encode($string), 1, -1);
      preg_match_all("/\\\\u[0-9a-fA-F]{4}|./mi", $string, $matches);
      return $matches[0];
  }

  function charCodeAt($string, $index) {
    $utf16CodeUnits = getUTF16CodeUnits($string);
    $unit = $utf16CodeUnits[$index];

    if(strlen($unit) > 1) {
        $hex = substr($unit, 2);
        return hexdec($hex);
    } else {
        return ord($unit);
    }
  }

  for($t = 0; $t < 32; $t++) {
    $i = $i ^ charCodeAt($hash, $t);
  }

  header("location: https://t" . ($i % 8) . ".rbxcdn.com/" . $hash);
?>
