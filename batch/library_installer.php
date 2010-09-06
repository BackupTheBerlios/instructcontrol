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

define('LIBRARY_BASE_PATH','./library_bin');
define('LIBRARY_INSTALL_PATH','./library');
define('EXTERNAL_LIBRARY_INSTALL_PATH','../library_ext');
define('WEBDIR','./public');
define('TESTDIR','./tests');

abstract class Speechmarks_LibraryInstaller
{
	
	protected $params = array();
	
	public abstract function install();
	
	/**
	 * @param string $k The setting name.
	 * @param string $v The setting value.
	 */
	public function setParam($k,$v)
	{
		$this->params[$k] = $v;
	}
	
	protected function getParam($k)
	{
		if (!array_key_exists($k,$this->params))
		{
			throw new Exception("Param $k not set");
		}
		return $this->params[$k];
	}
	
	protected function execIt($cmd)
	{
		#echo sprintf('EXEC: %s'."\n",$cmd);
		passthru($cmd);
	}
	
	protected function genGuid()
	{
		sleep(1);
		return time();
	}
	
	protected function runPreparedArchive($archive,$installTo)
	{
		$i = new Speechmarks_LibraryInstaller_PreparedTgz();
		$i->setParam('Archive',$archive);
		$i->setParam('InstallTo',$installTo);
		$i->install();
	}
	
	public function installTgz()
	{
		if (!file_exists($this->getParam('InstallTo')))
		{
			mkdir($this->getParam('InstallTo'));
		}
		$cmd = sprintf('tar  --directory=%s -zxf %s',
			escapeshellarg($this->getParam('InstallTo')),
			escapeshellarg($this->getParam('Archive'))
			);
		$this->execIt($cmd);
	}
	
}

class Speechmarks_LibraryInstaller_CopyOneFile extends Speechmarks_LibraryInstaller
{
	public function install()
	{
		#echo "Copy: ".LIBRARY_BASE_PATH.'/'.$this->getParam('Archive').' -> '.
		#	$this->getParam('InstallTo').'/'.$this->getParam('Archive');
		copy(
			LIBRARY_BASE_PATH.'/'.$this->getParam('Archive'),
			$this->getParam('InstallTo').'/'.$this->getParam('Archive')
			);
	}
}

class Speechmarks_LibraryInstaller_Tgz extends Speechmarks_LibraryInstaller
{
	
	public function install()
	{
		$dir = '/tmp/'.$this->genGuid();
		mkdir($dir);
		$this->execIt(sprintf('tar --directory=%s -zxf %s',
			escapeshellarg($dir),
			escapeshellarg(LIBRARY_BASE_PATH.'/'.$this->getParam('Archive'))
			));
		$this->execIt(sprintf('tar --directory=%s -zcf %s .',
			escapeshellarg($dir.'/'.$this->getParam('InternalSubdir')),
			escapeshellarg($dir.'.tgz')
			));
		$this->runPreparedArchive($dir.'.tgz',$this->getParam('InstallTo'));
	}
	
	
}

class Speechmarks_LibraryInstaller_ZipFile extends Speechmarks_LibraryInstaller
{
	
	public function install()
	{
		$dir = '/tmp/'.$this->genGuid();
		mkdir($dir);
		$this->execIt(sprintf('unzip -qq -d  %s %s ',
			escapeshellarg($dir),
			escapeshellarg(LIBRARY_BASE_PATH.'/'.$this->getParam('Archive'))
			));
		$this->execIt(sprintf('tar --directory=%s -zcf %s .',
			escapeshellarg($dir.'/'.$this->getParam('InternalSubdir')),
			escapeshellarg($dir.'.tgz')
			));
		if (!file_exists($this->getParam('InstallTo')))
		{
			mkdir($this->getParam('InstallTo'),0755,true);
		}
		$this->runPreparedArchive($dir.'.tgz',$this->getParam('InstallTo'));
	}
	
}

class Speechmarks_LibraryInstaller_PreparedTgz extends Speechmarks_LibraryInstaller
{
	
	public function install()
	{
		$this->installTgz();
	}
	
}

$libraries = parse_ini_file('./config/library_installer.ini',true);

foreach ($libraries as $libraryName=>$libraryData)
{
	$classname = 'Speechmarks_LibraryInstaller_'.$libraryData['Format'];
	$libraryInstaller = new $classname;
	foreach ($libraryData as $k=>$v)
	{
		$libraryInstaller->setParam($k,$v);
	}
	$libraryInstaller->install();
}


