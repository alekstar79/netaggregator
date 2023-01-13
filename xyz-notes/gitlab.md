[installing-gitlab-in-ubuntu](https://losst.ru/ustanovka-gitlab-v-ubuntu-18-04)

## Installing GitLab in Ubuntu

Preliminarily:

     sudo apt upgrade


1. Installing the repository

    > Then you need to download the repository installer from the official website.
    This script will download and install all the keys and tools necessary to connect
    the Gitlab repository to the system. To download and run it, run the command:

    ````
    curl -sS https://packages.gitlab.com/install/repositories/gitlab/gitlab-ce/script.deb.sh | sudo bash
    ````
    
2. Установка пакета программы
   
   ````
   sudo apt install gitlab-ce
   ````
   
3. Deploying GitLab

    > Now we need to prepare the program for work. First, you need to configure the URL
    that will open the GitLab interface. To do this, open the file /etc/gitlab/gitlab.rb
    and find the line external_url there. Here you need to specify your domain.

    ````
    sudo nano /etc/gitlab/gitlab.rb

    external_url 'http://gitlab.loc'
    ````

    > Save and close the file. After that, you need to rebuild the program,
    taking into account the changed configuration:

    ````
    sudo gitlab-ctl reconfigure
    ````

4. Add a domain to the /etc/hosts file

   ````
   sudo nano /etc/hosts
   
   127.0.0.1 gitlab.local
   ````

## How to completely remove/uninstall Gitlab

As described by Gitlab you normally install it by extending your sources
with the Gitlab repository using the provided script.
This extension allows you to use apt-get to install Gitlab as any application.
Furthermore this also applies for removing Gitlab. Check out this step-by-step instruction
for how to uninstall Gitlab:

1. Stop the gitlab service

    > If Gitlab is running you first have to stop its service to correctly remove it later.
    Use the Gitlab own command to stop the Gitlab service completely.
    Gitlab will confirm it and shut down with some console output.
    
        sudo gitlab-ctl stop

2. Self-Uninstall using the Gitlab control script

    > Gitlab comes with a self-contained uninstall script removing some files,
    dependencies and services. It will also automatically backup your configuration files
    and provide them as archive in your home folder. Use the following command
    to self-uninstall Gitlab. Gitlab will confirm the execution with some console output.

        sudo gitlab-ctl uninstall

3. Delete the package of gitlab

    > To fully delete Gitlab you have to use the apt-get packaging tool and remove
    the Gitlab package from your system. If you purge Gitlab from your system
    you will remove everything. This especially means your configuration files and user data.

    Command to fully remove:
    
        sudo apt purge gitlab-ce

    Command to save-remove:
        
        sudo apt remove gitlab-ce

4. Remove the remaining files and folders

    > After removing the gitlab-ce package the system warns you which folder could not be deleted
    successfully. Normally that should be `/opt/gitlab/`, `/var/opt/gitlab/` and `/var/log/gtitlab`
    To remove them you have to execute the systems remove command to recursively remove
    the remaining folders.

        sudo rm -rf /opt/gitlab
        sudo rm -rf /etc/gitlab
        sudo rm -rf /var/opt/gitlab

    Command (may replace the path):
        
        sudo rm -rf /org/gitlab/

5. Remove gitlab from your sources

    > Gitlab creates a custom source list entry for your machine to seamlessly work with apt-get.
    You should consider to remove this entry after uninstalling Gitlab.

6. Restart your machine
