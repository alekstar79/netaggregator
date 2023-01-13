<?php

declare(strict_types=1);

namespace Console\Command;

use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Command\Command;

use Doctrine\Common\DataFixtures\Executor\ORMExecutor;
use Doctrine\Common\DataFixtures\Purger\ORMPurger;
use Doctrine\Common\DataFixtures\Loader;
use Doctrine\ORM\EntityManagerInterface;

/**
 * Class LoadFixtures
 * @package Console\Command
 */
class LoadFixtures extends Command
{
    /** @var EntityManagerInterface */
    private EntityManagerInterface $em;

    /** @var string */
    private string $path;

    public function __construct(EntityManagerInterface $em, string $path)
    {
        parent::__construct();

        $this->path = $path;
        $this->em = $em;
    }

    protected function configure(): void
    {
        $this->setName('fixtures:load')->setDescription('Load fixtures');
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $output->writeln('<comment>Loading fixtures</comment>');

        $loader = new Loader();
        $loader->loadFromDirectory($this->path);

        $executor = new ORMExecutor($this->em, new ORMPurger());
        $executor->setLogger(static function($message) use($output) {
            $output->writeln($message);
        });

        $executor->execute($loader->getFixtures());
        $output->writeln('<info>Done!</info>');
    }
}
