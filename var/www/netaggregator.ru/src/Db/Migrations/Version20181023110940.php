<?php

declare(strict_types=1);

namespace Db\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20181023110940 extends AbstractMigration
{
    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE vktokens (id INT AUTO_INCREMENT NOT NULL, user_id INT NOT NULL, access_token VARCHAR(255) NOT NULL, expires_in INT DEFAULT NULL, UNIQUE INDEX UNIQ_9D34EF4CA76ED395 (user_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('CREATE TABLE rules (id INT AUTO_INCREMENT NOT NULL, user_id INT NOT NULL, tags LONGTEXT DEFAULT NULL COMMENT \'(DC2Type:json)\', stop LONGTEXT DEFAULT NULL COMMENT \'(DC2Type:json)\', query LONGTEXT DEFAULT NULL COMMENT \'(DC2Type:json)\', UNIQUE INDEX UNIQ_899A993CA76ED395 (user_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('CREATE TABLE comments (id INT AUTO_INCREMENT NOT NULL, post_id INT NOT NULL, date DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', author VARCHAR(255) NOT NULL, text LONGTEXT NOT NULL, INDEX IDX_5F9E962A4B89032C (post_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('CREATE TABLE posts (id INT AUTO_INCREMENT NOT NULL, create_date DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', update_date DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\', title VARCHAR(255) NOT NULL, content_short LONGTEXT NOT NULL, content_full LONGTEXT NOT NULL, meta_title VARCHAR(255) DEFAULT NULL, meta_description VARCHAR(255) DEFAULT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('ALTER TABLE comments ADD CONSTRAINT FK_5F9E962A4B89032C FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE comments DROP FOREIGN KEY FK_5F9E962A4B89032C');
        $this->addSql('DROP TABLE vktokens');
        $this->addSql('DROP TABLE rules');
        $this->addSql('DROP TABLE comments');
        $this->addSql('DROP TABLE posts');
    }
}
