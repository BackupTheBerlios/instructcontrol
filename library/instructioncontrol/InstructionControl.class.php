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

/**
 * InstructionControl classes for database storing/retrieval as well as document
 * generation and communication with APE.
 *
 * @package InstructionControl
 */

/**
 * This is the maximum amount of characters we can store in the normal data 
 * store (instruction_data_extra).
 */
define('INSTRUCTIONCONTROL_MAX_MAIN_DATA_LENGTH',255);

/**
 * Generates short (half rememberable) GUID's
 *
 * @return string
 */
function genSaneGuid() {
	$g = uniqid('g'.uniqid(),true);
	return strtolower(substr(preg_replace('/[^a-z0-9]/i','',$g),0,12));
}

/**
 * Exception class used in InstructionControl
 *
 * @package InstructionControl
 */
class InstructionControl_Exception extends Exception {}

/**
 * Simple database (MySQL) access class, you should use 
 * InstructionControl_DbFunctions really, this is only here because BerliOS does
 * not seem to have a PDO MySQL extension.
 *
 * @see InstructionControl_DbFunctions
 * @package InstructionControl
 */
class InstructionControl_DbFunctions_NonPdo implements InstructionControl_DbFunctions {
	
	public function __construct($connectionString,$username,$password,$pdoAttributes) {
		if (!preg_match('/host=([^;]+)/',$connectionString,$matches)) {
			throw new InstructionControl_Exception('Could not find DB Host '.$connectionString);
		}
		$host = $matches[1];
		if (!preg_match('/dbname=([^;]+)/',$connectionString,$matches)) {
			throw new InstructionControl_Exception('Could not find DB Host '.$connectionString);
		}
		$dbName = $matches[1];
		$conn = mysql_connect($host,$username,$password);
		mysql_select_db($dbName,$conn);
		$this->dbh = $conn;
		mysql_query("SET NAMES 'utf8' COLLATE 'utf8_general_ci'",$conn);
	}
	
	/**
	 * Prepares a statement with parameters pre-binded.
	 *
	 * @param string $sql Sql to execute, parameters should be in the form :[key].
	 * @param array $params Associative array containing parameters, keys should
	 *	be the same as the ones from $sql.
	 * @return PDOStatement.
	 */
	private function pdoPrepare($sql,$params) {
		$eParams = array();
		foreach ($params as $k=>$v) {
			if (preg_match('/^\:/',$k)) {
				throw new InstructionControl_Exception('Do not use keys with a : as the first character');
			}
			if ($v !== null) {
				$eParams[':'.$k] = "'".mysql_real_escape_string($v,$this->dbh)."'";
			} else {
				$eParams[':'.$k] = 'NULL';
			}
		}
		$q = str_replace(
			array_keys($eParams),
			array_values($eParams),
			$sql
			);
		return $q;
	}
	
	public function pdoGetResults($sql,$params) {
		$q = $this->pdoPrepare($sql,$params);
		$r = array();
		$qResult = mysql_query($q,$this->dbh);
		if ($qResult === false) {
			throw new InstructionControl_Exception("Error executing query $q");
		}
		while ($row = mysql_fetch_assoc($qResult)) {
			$r[] = $row;
		}
		#echo $q.print_r($r,1);
		return $r;
	}
	
	public function pdoInsert($sql,$params) {
		$q = $this->pdoPrepare($sql,$params);
		$qResult = mysql_query($q,$this->dbh);
		if ($qResult === false) {
			throw new InstructionControl_Exception("Error executing query $q");
		}
		$r = mysql_insert_id($this->dbh);
		return $r;
	}
	
	public function pdoUpdate($sql,$params) {
		$q = $this->pdoPrepare($sql,$params);
		$qResult = mysql_query($q,$this->dbh);
		if ($qResult === false) {
			throw new InstructionControl_Exception("Error executing query $q");
		}
	}
	function startTransaction() {
		mysql_query('START TRANSACTION');
	}
	function completeTransaction() {
		mysql_query('COMMIT');
	}
}

/**
 * Simple database (PDO/MySQL) access class.
 *
 * @package InstructionControl
 */
class InstructionControl_DbFunctions_Pdo implements InstructionControl_DbFunctions {
		
	private $dbh = null;
	
	/**
	 * Constructor
	 */
	public function __construct($connectionString,$username,$password,$pdoAttributes) {
		$this->dbh = new PDO($connectionString,$username,$password);
		foreach ($pdoAttributes as $k=>$v) {
			$this->dbh->setAttribute($k,$v);
		}
		$this->dbh->exec("SET NAMES 'utf8' COLLATE 'utf8_general_ci'");
	}
	
	private function getDbConn()
	{
		return $this->dbh;
	}
	
	/**
	 * Prepares a statement with parameters pre-binded.
	 *
	 * @param string $sql Sql to execute, parameters should be in the form :[key].
	 * @param array $params Associative array containing parameters, keys should
	 *	be the same as the ones from $sql.
	 * @return PDOStatement.
	 */
	private function pdoPrepare($sql,$params) {
		# uncomment to display sql executed
		#echo $sql.json_encode($params)."<br/><br/>";
		$conn = $this->dbh;
		$stmt = $conn->prepare($sql);
		foreach ($params as $k=>$v)
		{
			if (preg_match('/^\:/',$k)) {
				throw new InstructionControl_Exception('Do not use keys with a : as the first character');
			}
			$stmt->bindValue($k,$v,PDO::PARAM_STR);
		}
		return $stmt;
	}
	
	public function pdoGetResults($sql,$params) {
		$stmt = $this->pdoPrepare($sql,$params);
		$stmt->execute();
		$r = array();
		while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
			$r[] = $row;
		}
		return $r;
	}
	
	public function pdoInsert($sql,$params) {
		$stmt = $this->pdoPrepare($sql,$params);
		$stmt->execute();
		return $this->dbh->lastInsertId();
	}
	
	public function pdoUpdate($sql,$params) {
		$stmt = $this->pdoPrepare($sql,$params);
		$stmt->execute();
	}

	function startTransaction() {
		$this->dbh->beginTransaction();
	}
	function completeTransaction() {
		$this->dbh->commit();
	}
}

Interface InstructionControl_DbFunctions {
	/**
	 * Performs a SELECT on the database, returning the results as an associative array.
	 *
	 * @param string $sql Sql to execute, parameters should be in the form :[key].
	 * @param array $params Associative array containing parameters, keys should
	 *	be the same as the ones from $sql.
	 * @return array Associative array of results.
	 */
	function pdoGetResults($sql,$params);
	/**
	 * Executes an INSERT SQL statement, returning the last inserted id
	 *
	 * @param string $sql Sql to execute, parameters should be in the form :[key].
	 * @param array $params Associative array containing parameters, keys should
	 *	be the same as the ones from $sql.
	 * @return int The last inserted id.
	 */
	function pdoInsert($sql,$params);
	/**
	 * Executes an UPDATE SQL statement
	 *
	 * @param string $sql Sql to execute, parameters should be in the form :[key].
	 * @param array $params Associative array containing parameters, keys should
	 *	be the same as the ones from $sql.
	 */
	function pdoUpdate($sql,$params);
	/**
	 * Starts a database transaction.
	 */
	function startTransaction();
	/**
	 * Commits a database transaction.
	 */
	function completeTransaction();
}

/**
 * A collection of tightly bound classes for easily dealing with multi client
 * screen syncing.
 *
 * @package InstructionControl
 */
class InstructionControl {
	
	static $dbFunctions = null;
	
	/**
	 * Gets the (one and only) database wrapper. 
	 */
	public static function getDbFunctionsInstance() {
		if (self::$dbFunctions)
		{
			return self::$dbFunctions;
		}
		self::$dbFunctions = new InstructionControl_DbFunctions_NonPdo(
			self::getOption('PDO_DATABASE_CONNECTION_STRING'),
			self::getOption('PDO_DATABASE_USERNAME'),
			self::getOption('PDO_DATABASE_PASSWORD'),
			array(PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION)
			);
		return self::$dbFunctions;
	}
	
	// =========================================================================
	
	private static $options = array();
	/**
	 * Sets the confuration options for InstructionControl.
	 *
	 * InstructionControl needs to be aware of some external resources such as
	 * the database as well the APE server. Configure those using this function.
	 *
	 * <code>
	 * InstructionControl::setOptions(array(
	 *	'APE_CONFIG_SERVER'=>'ape.yourserver.com:6969',
	 *	'PDO_DATABASE_CONNECTION_STRING'=>'mysql:host=localhost;dbname=yours',
	 *	'PDO_DATABASE_USERNAME'=>'your_username',
	 *	'PDO_DATABASE_PASSWORD'=>'your_password',
	 *	));
	 * </code>
	 * 
	 * @param array $settingsArray An associative array of settings.
	 */
	public static function setOptions($settingsArray) {
		foreach ($settingsArray as $k=>$v) {
			self::$options[$k] = $v;
		}
	}
	/**
	 * Retrieves an option.
	 *
	 * @param string $key
	 * @return var
	 */
	public static function getOption($key) {
		return self::$options[$key];
	}
	/**
	 * Retrieves all options.
	 *
	 * @return array Associative array.
	 */
	public static function getOptions() {
		return self::$options;
	}
	/**
	 * Gets the Id of a Channel in the database.
	 *
	 * @param int $channelsetId The If of the ChannelSet.
	 * @param string $channelName The Name of the Channel.
	 * @return int $id The Id.
	 */
	public static function getChannelId($channelsetId,$channelName) {
		#print_r(array($channelsetId,$channelName));
		foreach (self::getDbFunctionsInstance()->pdoGetResults('
			SELECT
				channel.id
			FROM
				channel
			WHERE channel.name = :channelname
				AND channelset_id = :channelsetid
			',
			array('channelname'=>$channelName,'channelsetid'=>$channelsetId)
			) as $row) {
			return $row['id'];
		}
		return self::getDbFunctionsInstance()->pdoInsert(
			'INSERT INTO channel (channelset_id,name) VALUES (:channelset_id,:name)',
			array('name'=>$channelName,'channelset_id'=>$channelsetId));
	}
		/**                                
	 * Actually adds Data to an Instruction.
	 *
	 * When you have reserved an Instruction Id you can add Data to it, this can
	 * only be done once.
	 *
	 * @param int $instructionId The Id of the Instruction to add Data to.
	 * @param array $data Associative array of data, can be multi-dimensional.
	 * @see InstructionControl::reserveInstructionId().
	 */
	public static function addInstructionData($instructionId,$data) {
		return self::_addInstructionData($instructionId,$data);
	}
	/**
	 * @see InstructionControl::addInstructionData()
	 */
	private static function _addInstructionData($instructionId,$data,$parentId=null) {
		// Build up a huge assoc array so we can do a big join insert (this is
		// for only one level, we will call this function recursively to add 
		// lower levels
		$params = array('instruction_id'=>$instructionId);
		$i = 0;
		$sqlv = array();
		$unset = array();
		foreach ($data as $k=>$v) {
			if (is_scalar($v)) {
				if (mb_strlen($v,'8bit') <= INSTRUCTIONCONTROL_MAX_MAIN_DATA_LENGTH) // if it's short enough to just store
				{
					$params['k'.$i] = $k;
					$params['v'.$i] = $v;
					$params['p'.$i] = $parentId;
					$sqlv[] = sprintf('(:instruction_id,:k%d,:v%d,:p%d)',$i,$i,$i);
					$i++;
					$unset[] = $k;
				} else
				{
					$instructionDataId = self::getDbFunctionsInstance()->pdoInsert('
						INSERT INTO instruction_data (instruction_id,k,v,parent_id,extra)
						VALUES (:instruction_id,:k,:v,:parent_id,1)',
						array('instruction_id'=>$instructionId,'k'=>$k,'v'=>$v,
							'parent_id'=>$parentId));
					self::getDbFunctionsInstance()->pdoInsert('
						INSERT INTO instruction_data_extra (instruction_data_id,v)
						VALUES (:instruction_data_id,:v)',
						array('instruction_data_id'=>$instructionDataId,'v'=>$v));
					$unset[] = $k;
				}
			}
		}
		foreach ($unset as $k) { unset($data[$k]); }
		if ($sqlv) {
			self::getDbFunctionsInstance()->pdoInsert('
				INSERT INTO instruction_data (instruction_id,k,v,parent_id)
				VALUES '.implode(',',$sqlv),$params);
		}
		// Now we will deal with the lower levels...
		foreach ($data as $k=>$v) {
			$parentId = self::getDbFunctionsInstance()->pdoInsert('
				INSERT INTO instruction_data (instruction_id,k,parent_id) 
				VALUES (:i,:k,:p)',array('i'=>$instructionId,'k'=>$k,'p'=>$parentId));
			self::_addInstructionData($instructionId,$v,$parentId);
			$parentId = null;
		}
	}
	/**
	 * Used for loading all Instruction for a given channel.
	 *
	 * @param int $channelId The Id of the Channel.
	 * @return array Array of associative arrays, has the keys object_type, position and data.
	 */
	public static function getInstructionForChannel($channelId) {
		$ret = array();
		foreach(self::getDbFunctionsInstance()->pdoGetResults('
			SELECT
				instruction.position,
				user.communication_key,
				instruction.object_type,
				instruction_data.id AS data_id,
				instruction_data.parent_id AS data_parent_id,
				instruction_data.k AS data_k,
				if(
					(instruction_data.extra = 0),
					instruction_data.v,
					instruction_data_extra.v
					) AS data_v
			FROM instruction
			INNER JOIN user
				ON user.id = instruction.user_id
			LEFT JOIN instruction_data
				ON instruction_data.instruction_id = instruction.id
			LEFT JOIN instruction_data_extra
				ON instruction_data_extra.instruction_data_id = instruction_data.id
				AND instruction_data.extra = 1
			WHERE instruction.channel_id = :channelId
			',array('channelId'=>$channelId)) as $row) {
			if (!array_key_exists($row['position'],$ret))
			{
				$ret[$row['position']] = array();
			}
			$ret[$row['position']]['object_type'] = $row['object_type'];
			$ret[$row['position']]['communication_key'] = $row['communication_key'];
			$ret[$row['position']]['position'] = $row['position'];
			if (!array_key_exists('unstructured_data',$ret[$row['position']])) {
				$ret[$row['position']]['unstructured_data'] = array();
			}
			$ret[$row['position']]['unstructured_data'][$row['data_id']] = array_intersect_key(
				$row,array('data_parent_id'=>'','data_id'=>'','data_k'=>'','data_v'=>'')
				);
		}
		foreach (array_keys($ret) as $k=>$v) {
			$ret[$k]['data'] = self::_getInstructionForChannel_structureData(
				$ret[$k]['unstructured_data']);
			unset($ret[$k]['unstructured_data']);
		}
		return $ret;
	}
	/**
	 * Figures out the path in a multi dimensional array from the data structure
	 * stored in the database.
	 *
	 * @param array $ar Data loaded from the database.
	 * @param int $id The id of the data to find the path for.
	 * @return array The path to the data.
	 */
	private static function _getInstructionForChannel_structureData_findPath($ar,$id) {
		$p = array();
		$i = $id;
		while ($i) {
			$p[] = $ar[$i]['data_k'];
			$i = $ar[$i]['data_parent_id'];
		}
		return array_reverse($p);
	}
	/**
	 * Used internally for adding data deep into an associative array.
	 *
	 * @param array &$ar The associative array you wish to add data to.
	 * @param array $path Array detailing the position we wish to add $v too.
	 * @param var $v The data to add.
	 */
	private static function _getInstructionForChannel_structureData_addKey(&$ar,$path,$v)
	{
		$a =& $ar;
		foreach ($path as $p) {
			if (is_array($a) && (!array_key_exists($p,$a)))
			{
				$a[$p] = array();
			}
			$a =& $a[$p];
		}
		$a = $v;
	}
	/**
	 * Structures data in a channel.
	 *
	 * @param array Data mostly directly from the instruction_data table.
	 * @return array Multi dimensional associative array.
	 */
	private static function _getInstructionForChannel_structureData($unstructured) {
		$ar = array();
		foreach ($unstructured as $k=>$v) {
			self::_getInstructionForChannel_structureData_addKey(
				$ar,
				self::_getInstructionForChannel_structureData_findPath(
					$unstructured,
					$k
					),
				$v['data_v']
				);
		}
		return $ar;
	}
	/**
	 * Creates an instance of InstructionControl_User using information from the
	 * database.
	 *
	 * You will probably always want to user InstructionControl::getUser() instead.
	 *
	 * @return Associative array containing user information.
	 * @see InstructionControl::getUser()
	 * @throws InstructionControl_Exception should we fail loading a User.
	 * @access private
	 */
	public static function loadUser($loginKey,$knownAs=null) {
		foreach (self::getDbFunctionsInstance()->pdoGetResults('
			SELECT * FROM user WHERE login_key = :lk
			',array('lk'=>$loginKey)) as $row) {
            return $row;
        }
		throw new InstructionControl_Exception(sprintf('Could not find User %s',$loginKey));
	}
	/**
	 * Gets a User.
	 *
	 * If $loginKey is null a new User will be created, if it is not, it will try
	 *	and load that User.
	 *
	 * @param string $loginKey A Key which the User may have for loading himself.
	 * @param string $knownAs If supplied this could be displayed in the 
	 *		browser, it will be stored in the database.
	 * @return array Associative array containing user information.
	 * @throws InstructionControl_Exception should we fail loading a User.
	 */
	public static function getUser($loginKey=null,$knownAs=null) {
        // Make sure we have a User
		if ($loginKey) {
            // If we can just load it do so,
			$user = self::loadUser($loginKey,$knownAs);
		} else {
            // otherwise we need to create a new record
            $loginKey = genSaneGuid();
            $communicationKey = genSaneGuid();
            $insertData = array('login_key'=>$loginKey,
                'communication_key'=>$communicationKey,'known_as'=>$knownAs);
            $id = self::getDbFunctionsInstance()->pdoInsert('
                insert into user (login_key,communication_key,known_as)
                values (:login_key,:communication_key,:known_as)
                ',$insertData
                );
            $user = array_merge(array('id'=>$id),$insertData);
        }
        // If known_as is different from what was passed in, sync it
        if (($knownAs) && ($user['known_as'] != $knownAs)) {
            $stmt = InstructionControl::getDbFunctionsInstance()->pdoUpdate('
                update user set known_as = :ka where id = :id
                ',array('ka'=>$knownAs,'id'=>$user['id'])
                );
            $stmt->execute();
            $user['known_as'] = $knownAs;
        }
        return $user;
	}
	/**
	 * Updates a users details to.
	 *
	 * @param $loginKey The Login key of the user.
	 * @param array Associative array of the users details, must be valid.
	 */
	public static function setUserDetails($loginKey,$details) {
		$sqlSet = array();
		$sqlData = array();
		foreach ($details as $k=>$v) {
			$kk = preg_replace('/[^a-z_]/','_',$k);
			$sqlSet[] = sprintf('%s = :%s',$kk,$kk);
			$sqlData[$kk] = $v;
		}
		$sqlData['login_key'] = $loginKey;
		$sql = sprintf(
			'update user set %s where login_key = :login_key',
			implode(', ',$sqlSet)
			);
		self::getDbFunctionsInstance()->pdoUpdate($sql,$sqlData);
	}
	/**
	 * Mark a User as having interacted with a Channelset.
	 *
	 * You can NOT call this multiple times for a User, this will be fixed
	 *
	 * @todo Make this callable multiple times without erroring.
	 * @param int $userId
	 * @param int $channelsetId
	 */
	public static function setUserChannelset($userId,$channelsetId) {
        $r = self::getDbFunctionsInstance()->pdoInsert('
            INSERT INTO user_channelset (user_id,channelset_id)
            SELECT
                user.id AS user_id,
                channelset.id AS channelset_id
            FROM user
            INNER JOIN channelset
            LEFT JOIN user_channelset
                ON user_channelset.channelset_id = channelset.id
                AND user_channelset.user_id = user.id
            WHERE
                user.id = :uid AND channelset.id = :cid
                AND user_channelset.user_id is null;
			',array('uid'=>$userId,'cid'=>$channelsetId));
	}
    /**
     * Will return all User for a specific ChannelSet.
     *
     * @param int $channelsetId The Id of a ChannelSet.
     * @return array An array of Associative arrays.
     */
    public static function listUserForChannelset($channelsetId) {
        $allData = self::getDbFunctionsInstance()->pdoGetResults('
			SELECT user.* FROM user
            INNER JOIN user_channelset
                ON user_channelset.user_id = user.id
            WHERE user_channelset.channelset_id = :cid
			',array('cid'=>$channelsetId));
		$r = array();
		foreach ($allData as $ad) {
			$r[] = $ad;
		}
		return $r;
    }
    /**
     * Will retrieve the details about one specific User
     *
     * @param int $channelsetId The If of a ChannelSet
     * @param string $communicationKey The Communication key for the user
     * @return array Associative array including all the details
     */
    public static function getUserByCommunicationKey($channelsetId,$communicationKey) {
    	foreach (self::listUserForChannelset($channelsetId) as $userDetails) {
    		if ($userDetails['communication_key'] == $communicationKey) {
    			return $userDetails;
    		}
    	}
    	return null;
    }
	/**
	 * Reserves a Position for an Instruction, see below for explanation.
	 *
	 * This function will reserve a Position for an Instruction, however the 
	 * Position itself is not of very much direct use to the developer so
	 * instead it will return the Id of of an Instruction... The position is
	 * reserved, but there isn't really any requirement to know it at this point.
	 *
	 * @param int $channelId The name of the channel.
	 * @param int $userId The Id of the User who added the Instruction
	 * @param string $objectType The objectType of the Instruction you will be reserving.
	 * @return int The Id of the Instruction.
	 */
	public static function reserveInstructionId($userId,$channelId,$objectType) {
		return self::getDbFunctionsInstance()->pdoInsert('
			INSERT INTO instruction (channel_id,object_type,user_id,position)
			SELECT 
				:channel_id as channel_id,
				:object_type as object_type,
				:user_id as user_id,
				coalesce(max(instruction.position)+1,0) as position
			FROM instruction
			WHERE channel_id = :channel_id
			',array('object_type'=>$objectType,'user_id'=>$userId,'channel_id'=>$channelId)
			);
	}
	/**
	 * Will retrieve a Position from the database.
	 *
	 * @param int $instructionId The Id of an Instruction.
	 * @return int The Position.
	 */
	public static function getPositionForInstructionId($instructionId) {
		foreach(self::getDbFunctionsInstance()->pdoGetResults('select position from instruction
			where id = :id',array('id'=>$instructionId)) as $row) {
			return $row['position'];
		}
		return null;
	}
	/**
	 * This function will send an Instruction (properties) to the other clients
	 * on the webpage.
	 *
	 * @param string $channelset The Channelset name
	 * @param string $channelId The Id of the Channel
	 * @param array The output from InstructionControl::generateReturnDocument()
	 *
	 * @see InstructionControl::generateReturnDocument()
	 */
	public static function notifyOtherClientsApe($channelset,$channelId,$data) {
		$APEserver = 'http://'.self::getOption('APE_CONFIG_SERVER').'/?';
		$APEPassword = 'testpasswd';
		
		if ($channelId === null) {
			$channelsetId = InstructionControl::getChannelsetId($channelset);
			$channelId = InstructionControl::getChannelId($channelsetId,'main');
		}
		
		$channelName = self::getChannelname($channelId);
		$cmd = array(array( 
			'cmd' => 'inlinepush', 
			'params'=>array( 
				'password'  => $APEPassword, 
				'raw' => 'instruction',
				'channel' => $channelset.'_'.$channelName, 
				'data' => $data
				)
			));
		$url = $APEserver.rawurlencode(json_encode($cmd));
		$answerJson = (file_get_contents($url));
		$answer = array_pop(json_decode($answerJson,true));
		if (!$answer || $answer['data']['value'] != 'ok') {
			throw new Exception("Could not notify other clients ".print_r($cmd,1).print_r($answer,1));
		}
		
	}
	/**
	 * Gets the name of a channel.
	 *
	 * @param int $channelId The Id of a channel.
	 * @return string
	 */
	public static function getChannelname($channelId)
	{
		foreach (self::getDbFunctionsInstance()->pdoGetResults('select name from channel where id = :id',
			array('id'=>$channelId)
			) as $row)
		{
			return $row['name'];
		}
		return null;
	}
	
	/**
	 * Will return the Id of Channelset, if it does not exist, it will be created.
	 * 
	 * @param string $name The name of the ChannelSet
	 * @return int
	 */
	public static function getChannelsetId($name) {
		foreach (self::getDbFunctionsInstance()->pdoGetResults('SELECT id FROM channelset WHERE name = :name',
			array('name'=>$name)) as $row) {
			return $row['id'];
		}
		return self::getDbFunctionsInstance()->pdoInsert('
			INSERT INTO channelset (name) values (:name)',
			array('name'=>$name)
			);
	}
	
	/**
	 * Will return the Ids of Channels within a Channelset.
	 *
	 * @param int $channelsetId The of the Channelset to list.
	 * @return array An array of Channel Ids.
	 */
	public static function getChannelsetChannelIds($channelsetId) {
		$r = array();
		foreach(self::getDbFunctionsInstance()->pdoGetResults('
			SELECT id FROM channel where channelset_id = :cs ORDER BY id ASC',
			array('cs'=>$channelsetId)
			) as $row) {
			$r[] = $row['id'];
		}
		return $r;
	}
	
	/**
	 * We return data back from the server in a standard form for ease of 
	 * communication.
	 *
	 * @param string $documentType What is described within the ReturnDocument.
	 * @param array $systemErrors System errors are internal problems, eg. 
	 *	database not being contactable. Key value pairs, the key is the code of 
	 *	the error with the value being a message to the user.
	 * @param array $businessErrors Business errors are errors not related to 
	 *	user input or the system itself, but the state of the system. For 
	 *	example if you're designing a shopping cart, a business error might be
	 *	that there is no stock left. Key value pairs, the key is the code of the
	 *	error with the value being a message to the user.
	 * @param array $validationErrors Validation errors are related directly to
	 *	user input, for example a email address not having an "@" symbol. This
	 *	should be supplied as key value pairs with the key being the input field
	 *	that causes teh problem and the value being a message to the user.
	 * @return array A large associative array, this will probably be 
	 *	json_encode()'d.
	 */
	public static function generateReturnDocument($documentType,$systemErrors,
		$businessErrors,$validationErrors,$metaData,$successData) {
		$doc = array(
			'header'=>array(
				'document_type'=>$documentType,
				'system_error'=>$systemErrors,
				'business_error'=>$businessErrors,
				'validation_error'=>$validationErrors,
				'meta_data'=>$metaData,
				),
			'body'=>$successData
			);
		if ((sizeof($doc['header']['business_error']) > 0) ||
			(sizeof($doc['header']['system_error']) > 0) ||
			(sizeof($doc['header']['validation_error']) > 0)) {
			$doc['body'] = array();
		}
		return $doc;
	}
	
	public function startTransaction() {
		self::getDbFunctionsInstance()->startTransaction();
	}
	
	public function completeTransaction() {
		self::getDbFunctionsInstance()->completeTransaction();
	}
}
