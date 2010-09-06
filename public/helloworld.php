<?php
/*
Copyright (C) 2010 Matthew Forrester.

This library is free software; you can redistribute it and/or
modify it under the terms of the GNU Lesser General Public
License as published by the Free Software Foundation; either
version 2.1 of the License, or (at your option) any later version.

This library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public
License along with this library; if not, write to the Free Software
Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
*/
?><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<?php
function icEcho($str) {
	echo htmlentities( $str, ENT_QUOTES, "UTF-8" );
}
?>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">
<head>
	<title><?php icEcho($config['php_base_url']); ?>/<?php icEcho($config['channelset']['name']); ?></title>
	<meta http-equiv="Content-type" value="text/html; charset=UTF-8" />
	
	<script type="text/javascript" src="/js/InstructionControl.class.js"></script>
	<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js"></script>
	<!-- <script type="text/javascript" src="<?php echo $config['ape']['jsf']['root']; ?>/Clients/JavaScript.js"></script> -->

	<script type="text/javascript" language="JavaScript">
		$(document).ready(function()
		{
			/*
			 * Configure the APE client so it knows how to communicate with the APE server
			 */
			function lowLevelConfigApe() {
				APE.Config.baseUrl = <?php echo json_encode($config['ape']['jsf']['url']); ?>;
				APE.Config.domain = 'auto';
				APE.Config.server = <?php echo json_encode($config['ape']['server']); ?>;
				(function(){
					for (var i = 0; i < arguments.length; i++)
						APE.Config.scripts.push(APE.Config.baseUrl + '/Source/' + arguments[i] + '.js');
				})('mootools-core', 'Core/APE', 'Core/Events', 'Core/Core', 'Pipe/Pipe', 'Pipe/PipeProxy', 'Pipe/PipeMulti', 'Pipe/PipeSingle', 'Request/Request','Request/Request.Stack', 'Request/Request.CycledStack', 'Transport/Transport.longPolling','Transport/Transport.SSE', 'Transport/Transport.XHRStreaming', 'Transport/Transport.JSONP', 'Core/Utility', 'Core/JSON');
			}
			
			// lowLevelConfigApe()
			
			/*
			 * Create a new InstructionClient, this instance will do the 
			 * communication between the different InstructionControl components
			 */
			var client = new InstructionClient_JustMe(
				<?php echo json_encode($config['channelset']['name']); ?>,
				<?php echo json_encode($user['communication_key']); ?>,
				ajaxSlave_jQuery,
				<?php echo json_encode($config['php_base_url']) ?>,
				{ }
				);
			
			/*
			 * When the InstructionClient is ready to send/receive calls, we 
			 * will join the "browser_to_browser" channel and bind reciept of
			 * Instruction in channel "browser_to_browser" with the ObjectType
			 * "helloworld" to fire the function "listening". We also set up
			 * the button using jQuery to fire the "talking" function.
			 */
			InstructionControl.getInstance().bindClientReady(function() {
				InstructionControl.getInstance().join('browser_to_browser');
				InstructionControl.getInstance().bind('browser_to_browser','helloworld',listening);
				$('#submit_helloworld_message').bind('click',talking);
			});
			
			/*
			 * Attach the InstructionClient to InstructionControl. When this
			 * occurs the client will begin the process of making itself ready
			 * and will then fire an functions bound with the 
			 * InstructionControl.getInstance().bindClientReady() function.
			 */
			InstructionControl.getInstance().setClient(client);
			           
		});
		
		/*
		 * When an Instruction of type "helloworld" on channel "browser_to_browser"
		 * is recieved this function is fired (see above). It accepts one parameter
		 * which is an instance of Instruction. This function will add messages
		 * to the div element with the id "helloworld_log".
		 */
		function listening(instruction) {
			var m = '<div>'+instruction.getCommunicationKey()+': ';
			m = m + instruction.getData().message+'</div>';
			$('#helloworld_log').html($('#helloworld_log').html()+m);
		}
		/*
		 * When the submit element with the id "submit_helloworld_message" is 
		 * pressed this function will be fired (see above). It first does some
		 * cleanup of the input and then sends it through InstructionControl to
		 * the PHP REST service.
		 */
		function talking() {
			var m = $('#helloworld_message').val().replace(/[^a-z0-9 ]/,'*');
			InstructionControl.getInstance().send('browser_to_browser','helloworld',{'message':m});
		}
	</script>
</head>
<body>
	<h1>Instruction Control HelloWorld Demo</h1>
	<div id="helloworld_log"></div>
	<input type="text" name="helloworld_message" id="helloworld_message"/>
	<input type="submit" name="submit_helloworld_message" 
		id="submit_helloworld_message" value="talk"/>
</body>
</html>
