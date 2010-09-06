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

$libraries = parse_ini_file('./config/library_installer.ini',true);

foreach ($libraries as $libraryName=>$libraryData)
{
	if (array_key_exists('Url',$libraryData)) {
		$url = $libraryData['Url'];
		echo sprintf('Downloading "%s" from "%s"',$libraryName,$url);
		$cmd = sprintf(
			'wget --quiet --output-document=%s %s',
			escapeshellarg('library_bin/'.$libraryData['Archive']),
			escapeshellarg($url)
			);
		passthru($cmd);
	} elseif (array_key_exists('ReferenceUrl',$libraryData)) {
		echo sprintf('You will need to download "%s" from "%s" and put it in "library_bin"',$libraryName,$libraryData['ReferenceUrl']);
	} else {
		echo sprintf('You will need to acquire library "%s", I do not know how to get it!',$libraryName);
	}
	echo ".\n\n";
}


