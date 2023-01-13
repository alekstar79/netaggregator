<?php

declare(strict_types=1);

namespace Db\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20181105145712 extends AbstractMigration
{
    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'postgresql', 'Migration can only be executed safely on \'postgresql\'.');

        $this->addSql('CREATE TABLE covers (id INT NOT NULL, owner INT NOT NULL, group_id INT NOT NULL, last_subscriber TEXT DEFAULT NULL, top_commentor TEXT DEFAULT NULL, top_liker TEXT DEFAULT NULL, time TEXT DEFAULT NULL, date TEXT DEFAULT NULL, time_zone VARCHAR(255) DEFAULT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_F08DF1B2FE54D947 ON covers (group_id)');
        $this->addSql('CREATE INDEX IDX_F08DF1B2CF60E67C ON covers (owner)');
        $this->addSql('COMMENT ON COLUMN covers.last_subscriber IS \'(DC2Type:json)\'');
        $this->addSql('COMMENT ON COLUMN covers.top_commentor IS \'(DC2Type:json)\'');
        $this->addSql('COMMENT ON COLUMN covers.top_liker IS \'(DC2Type:json)\'');
        $this->addSql('COMMENT ON COLUMN covers.time IS \'(DC2Type:json)\'');
        $this->addSql('COMMENT ON COLUMN covers.date IS \'(DC2Type:json)\'');
        $this->addSql('CREATE TABLE owners (id INT NOT NULL, user_id INT NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_427292FAA76ED395 ON owners (user_id)');
        $this->addSql('ALTER TABLE covers ADD CONSTRAINT FK_F08DF1B2CF60E67C FOREIGN KEY (owner) REFERENCES owners (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'postgresql', 'Migration can only be executed safely on \'postgresql\'.');

        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE covers DROP CONSTRAINT FK_F08DF1B2CF60E67C');
        $this->addSql('DROP TABLE covers');
        $this->addSql('DROP TABLE owners');
    }
}
