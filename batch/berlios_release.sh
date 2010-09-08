#!/bin/sh
# 
# Copyright (C) 2010 Matthew Forrester.
# 
# This library is free software; you can redistribute it and/or
# modify it under the terms of the GNU Lesser General Public
# License as published by the Free Software Foundation; either
# version 2.1 of the License, or (at your option) any later version.
# 
# This library is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
# Lesser General Public License for more details.
# 
# You should have received a copy of the GNU Lesser General Public
# License along with this library; if not, write to the Free Software
# Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
# 
cd $PWD
HTDOCS=/home/groups/instructcontrol/htdocs
echo "Enter your MySQL password:"
read MYSQL_PASSWORD
cat public/icdemo.php  | sed 's|/../|./|' > t.txt
cat t.txt > public/icdemo.php
cat docs/instructioncontrol/database_structure.mysql  | sed s/DROP.*// > t.txt
cat t.txt > docs/instructioncontrol/database_structure.mysql
cat config/icdemo.defines.php | sed 's_/../library_/./library_' > t.txt
mv t.txt config/icdemo.defines.php

cat config/icdemo.defines.php | sed 's|mysql:host=localhost;dbname=icdemo|mysql:host=db.berlios.de;dbname=instructcontrol|' > t.txt
mv t.txt config/icdemo.defines.php
cat config/icdemo.defines.php | sed "s|'INSTRUCTIONCONTROL__PDO_DATABASE_USERNAME','icdemo'|'INSTRUCTIONCONTROL__PDO_DATABASE_USERNAME','instructcontrol'|" > t.txt
mv t.txt config/icdemo.defines.php
cat config/icdemo.defines.php | sed "s|'INSTRUCTIONCONTROL__PDO_DATABASE_PASSWORD','icdemo'|'INSTRUCTIONCONTROL__PDO_DATABASE_PASSWORD','${MYSQL_PASSWORD}'|" > t.txt
mv t.txt config/icdemo.defines.php

mv docs/ public/
mv config/ public/
mv library/ public/

cd public
export ARCHIVE=${PWD}/../t.tgz
tar -zcf $ARCHIVE .
echo $ARCHIVE
echo "Now run \"cd $HTDOCS ; rm -rf * ; tar -zxf $ARCHIVE"

