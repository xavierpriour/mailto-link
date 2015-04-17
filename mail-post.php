<?php
// This is a simple class that sends send an email when posted to.
// Its main use is as a back-end for our popup email form

$to = 'support@timetom.com';

class MailPost {
  private $mailTo;
  private $timestamp;
  private $ip;
  private $host;

  private $mailFrom = '';
  private $subject = '';
  private $text = '';

  function MailPost($array, $mailTo) {
    $this->mailTo = $mailTo;
    $this->timestamp = date("F jS Y, h:iA.", time());
    $this->ip = $_SERVER['REMOTE_ADDR'];
    $this->host = gethostbyaddr($this->ip);

    if(isset($array['from']) && $array['from']) {
      $this->mailFrom = $array['from'];
    }
    if(isset($array['subject']) && $array['subject']) {
      $this->subject = $array['subject'];
    }
    if(isset($array['text']) && $array['text']) {
      $this->text = $array['text'];
    }
  }

  function send() {
    $body = "
    <p>$this->text</p>
    <hr/>
    <p>This mail was sent on <strong>$this->timestamp</strong> by <strong>$this->ip</strong> ($this->host)</p>
    ";
    $headers = "From: $this->mailFrom \r\n";
    $headers .= "Reply-To: $this->mailFrom \r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=ISO-8859-1\r\n";
    $message = "<html><body>$body</body></html>";
    $result = array();
    // error_log("sending mail to $this->mailTo");
    if (mail($this->mailTo, $this->subject, $message, $headers)) {
      $result['status'] = 'success';
    } else {
      $error = error_get_last();
      $result['status'] = 'failure';
      $result['error'] = $error;
    }
    return $result;
  }
}

$mailPost = new MailPost($_POST, $to);
$result = $mailPost->send();
if(isset($_POST['then'])) {
  header('Location: '.$_POST['then']);
} else {
  echo(json_encode($result));
}
?>
