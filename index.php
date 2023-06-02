<?php
    $user_id = $_GET["id"];

    $servername = "";
    $username = "";
    $password = "";
    $database = "";
    $table_name = "";

    $perRefer = 1;
    $botName = ""; //username without @

    $connection = mysqli_connect($servername,$username,$password,$database);

    if(!$connection){
        die("Error : ".mysqli_connect_error);
    }

    $sql = "SELECT user_id,inviter,verified FROM $table_name WHERE user_id = $user_id";
    $res = mysqli_query($connection,$sql);
    $row = mysqli_fetch_assoc($res);
    if(!$row["verified"]){
        $inviter = $row["inviter"];
        $user_id = $row["user_id"];
        $ip = getIp();
        $sql = "UPDATE $table_name SET ip='$ip',verified=1 WHERE user_id = $user_id;";
        $sql .= "UPDATE $table_name SET invites=invites+1,balance=balance+$perRefer WHERE user_id=$inviter;";
        mysqli_multi_query($connection,$sql);
        header("Location: https://telegram.me/$botName");
    }else{
        header("Location: https://telegram.me/$botName");
    }

    function getIp(){
        $url = "https://api-bdc.net/data/client-ip";
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_FOLLOWLOCATION, true);
        $response = json_decode(curl_exec($curl))->ipString;
        return $response;
    }

?>