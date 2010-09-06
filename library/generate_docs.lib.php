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

function execIt($cmd)
{
	echo $cmd."\n";
	passthru($cmd);
}

function genGuid() {
	sleep(1);
	return time();
}
function generateJsToolkitDocs($sourceFiles) {
	$cwd = getcwd();
	execIt('rm -rf '.escapeshellarg($cwd.'/docs/jsdoc'));
	chdir('library/jsdoc-toolkit');
	$sf = array();
	foreach ($sourceFiles as $s) {
		$sf[] = escapeshellarg($cwd.'/'.$s);
	}
	$sf = implode($sf);
	execIt('java -jar jsrun.jar app/run.js -t=templates/jsdoc/ '.$sf);
	rename('out',$cwd.'/docs/jsdoc');
	chdir($cwd);
	return true;
}

function generateJsDocs($sourceFiles,$destDir) {
	# Settings
	$copySourceTo = '/tmp/'.genGuid();
	$projectDirectory = '/tmp/'.genGuid();
	
	$sourceFilesEsc = array();
	foreach ($sourceFiles as $sf) {
		$sourceFilesEsc[] = escapeshellarg($sf);
	}
	
	# Working
	mkdir($copySourceTo);
	$cmd = sprintf('tar -zc %s | tar -zx -C %s',implode(' ',$sourceFilesEsc),
		escapeshellarg($copySourceTo));
	execIt($cmd);
	foreach ($sourceFiles as $f) {
		$fn = $copySourceTo.'/'.$f;
		$c = file_get_contents($fn);
		$c = preg_replace('/([\t ]+\*[\t ]+)@/',"\$1\n\$1@",$c);
		file_put_contents($fn,$c);
	}
	mkdir($projectDirectory);
	execIt('rm -rf '.escapeshellarg($destDir));
	mkdir($destDir);
	execIt(sprintf('naturaldocs -i %s -o HTML %s -p %s',
		escapeshellarg($copySourceTo),escapeshellarg($destDir),
		escapeshellarg($projectDirectory)
		));
}
function generatePhpDocs($sourceFiles,$destDir) {
	execIt('rm -rf '.escapeshellarg($destDir));
	foreach ($sourceFiles as $sf) {
		$sourceFilesEsc[] = escapeshellarg($sf);
	}
	execIt(sprintf('phpdoc -f %s -t %s',implode(',',$sourceFilesEsc),escapeshellarg($destDir)));
}

function generateMarkdownDirectoryDoc($docDirs) {
	require_once 'library/markdown.php';
	foreach ($docDirs as $docDir)
	{
		$text = markdown(file_get_contents($docDir.'/index.markdown.text'));
		$title = 'Untitled';
		preg_match('/<h1>(.*)<\/h1>/i',$text,$matches);
		if (sizeof($matches) >= 1)
		{
			$title = $matches[1];
		}
		$header = preg_replace('/\{TITLE\}/',$title,file_get_contents($docDir.'/../header.html'));
		file_put_contents(
			$docDir.'/index.html',
			$header.$text.file_get_contents($docDir.'/../footer.html')
			);
	}
}
