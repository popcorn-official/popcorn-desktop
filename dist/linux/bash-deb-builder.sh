#!/bin/bash
# published under GPL3.0

# don't modify this file, see 'package-linux' instead
# requires : build-essential

. $1 #get information about the package

version=$(cat ../../package.json | sed '/version/!d' | sed s/\"version\"://g | sed s/\"//g | sed s/\ //g | sed s/,//g) #specific to node-webkit apps

scriptdir=$(echo $PWD) #bash-deb-builder.sh dir
maindir=$(cd ../.. && echo $PWD) #main dir

func_series() {
	mainseries=$(echo $series | sed "s/ .*//g")
	remainingseries=$(echo $series | sed "s/$mainseries //g")
}

func_name() {
	name="${name,,}" #no uppercase
	name="$(echo $name | tr ' ' '-')" #no spaces
}

func_maintainer() {
	export DEBEMAIL="$email"
	export DEBFULLNAME="$maintainer"
}

func_dep() {
	[[ -z "$dependencies" ]] || [[ "$dependencies" == "none" ]] || [[ "$dependencies" == "null" ]] && dependencies=
}

func_exclude() {
	exclude=$(echo "$exclude" | sed 's/ / **\//g') #globstar hack
}

func_size() {
	size=$(du -s PACKAGE | cut -f1)
}

func_appfiles() {
	echo -e "\n- Copying app files to new directory" #DEBUG

	shopt -s globstar
	func_name #transforms unwanted caracters in name entry
	
	for arch in "32" "64" ; do
		[ $arch == "32" ] && files=$(echo $files32 | sed "s/32/$arch/g")
		[ $arch == "64" ] && files=$(echo $files64 | sed "s/64/$arch/g")

		mkdir -p PACKAGE/$name-$version/$arch/$installdir/$name
		if [[ ! -z $launcher ]] ; then
			mkdir -p PACKAGE/$name-$version/$arch/usr/share/applications
			echo "$launcher" &> PACKAGE/$name-$version/$arch/usr/share/applications/$name.desktop
			chmod 644 PACKAGE/$name-$version/$arch/usr/share/applications/$name.desktop
		fi
		cp -r $files PACKAGE/$name-$version/$arch/$installdir/$name
		cd PACKAGE/$name-$version/$arch/$installdir/$name
		func_exclude
		rm -rf **/$exclude **/*.*~ &> /dev/null
		cd $scriptdir
	done
}

func_modify() {
	#changelog
	func_series
	sed -i "s/unstable/$mainseries/g" changelog
	sed -i "s/$version-1/$version/g" changelog
	sed -i "s/(Closes: #nnnn)  <nnnn is the bug number of your ITP>//g" changelog
	
	#control
	sed -i "s/unknown/$section/g" control
	sed -i '/Homepage/d' control
	sed -i "s/<insert up to 60 chars description>/$short_description/g" control
	sed -i '/long description/d' control
	echo "$long_description" | tee -a control &> /dev/null
	echo "Homepage: $homepage" | tee -a control &> /dev/null
	func_dep #makes sure that dependencies are well written if empty
	sed -i "s/\${shlibs:Depends}/$dependencies/g" control
	sed -i '7,8d' control
	
	#copyrights
	echo "$copyright" &> copyright
	
	#rules
	echo "$rules" &> rules
	
	#post-install and remove script
	echo "$postinst" &> postinst
	echo "$prerm" &> prerm
	sudo chmod 755 post* pre*
}

func_basefiles() {
	echo -e "\n- Creating tar.xz archive" #DEBUG

	cd PACKAGE/$name-$version
	tar --xz -cf ../$name"_"$version".orig.tar.xz" *

	echo -e "\n- Creating 'debian' directory" #DEBUG

	dh_make -s -y -c $license -f $name"_"$version".orig.tar.xz"
	cd debian && rm -rf *ex *EX README* docs
	func_modify #insert modification to changelog, copyright, rules, control, etc.
	#TODO:changelog is not detailed.
	cd $scriptdir
}

func_build() {
	echo -e "\n- Build with 'dpkg-buildbackage'" #DEBUG

	cd PACKAGE/$name-$version
	dpkg-buildpackage -S -rfakeroot -pgpg -k$gpgkey
	cd $scriptdir
}

func_postbuild() {
	mv PACKAGE sources"_"$version
	rm -rf sources"_"$version/$name-$version
}

func_upload() {
	echo -e "\n- Uploading to $ppa" #DEBUG

	cd sources"_"$version
	dput $ppa $name"_"$version"_source.changes"
	cd $scriptdir

	echo -e "\n- The package is only listed in '$mainseries'. You might want to go on Launchpad and publish the packages under other series too." #DEBUG
}

#Exec
rm -rf PACKAGE sources"_"$version #always clean directories
func_maintainer #set environment variables
func_appfiles #adds the program files

func_basefiles #creates needed files
func_build #create .dsc
func_postbuild #clean working dir and keep sources
[ ! -z $ppa ] && func_upload #uploads to the given PPA.
