<?php

declare(strict_types=1);

namespace Console\Command;

use Symfony\Component\Console\Question\ChoiceQuestion;
use Symfony\Component\Console\Helper\QuestionHelper;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Command\Command;

use InvalidArgumentException;

use Manager\ExtendsTrait;

/**
 * Class CacheClear
 * @package Console\Command
 */
class CacheClear extends Command
{
    use ExtendsTrait;

    /** @var array */
    private array $paths;

    public function __construct(array $paths)
    {
        parent::__construct();

        $this->paths = $paths;
    }

    protected function configure(): void
    {
        $this->setName('cache:clear')
            ->setDescription('Clear cache')
            ->addArgument('alias', InputArgument::OPTIONAL, 'The alias of available paths');
    }

    private function remove(string $path): void
    {
        if (is_dir($path)) {
            $this->rmdir($path, true);
        } else if (is_file($path)) {
            unlink($path);
        }
    }

    public function execute(InputInterface $input, OutputInterface $output): void
    {
        $output->writeln('<comment>Run clear cache</comment>');
        $alias = $input->getArgument('alias');
        $paths = [];

        if (empty($alias)) {
            $opts = array_merge(['all'], array_keys($this->paths));
            $question = new ChoiceQuestion('Choose path', $opts, 0);

            /** @var QuestionHelper $helper */
            $helper = $this->getHelper('question');
            $alias = $helper->ask($input, $output, $question);
        }
        if ($alias === 'all') {
            $paths = $this->paths;

        } else if (is_string($alias)) {
            if (!array_key_exists($alias, $this->paths)) {
                throw new InvalidArgumentException("Unknown path alias '$alias'");
            }

            $paths = [$alias => $this->paths[$alias]];
        }

        foreach ($paths as $path) {
            if (file_exists($path)) {
                $output->writeln('Clear '. $path);
                $this->remove($path);

            } else {
                $output->writeln('Skip '. $path);
            }
        }

        $output->writeln('<info>Done</info>');
    }
}
