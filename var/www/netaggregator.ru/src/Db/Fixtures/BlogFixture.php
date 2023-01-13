<?php

/**
* @noinspection UnknownInspectionInspection
* @noinspection PhpUnused
*/

declare(strict_types=1);

namespace Db\Fixtures;

use Doctrine\Common\DataFixtures\FixtureInterface;
use Doctrine\Common\Persistence\ObjectManager;

use DateTimeImmutable;
use Exception;

use Faker\Factory;

use App\Entity\Post\Content;
use App\Entity\Post\Meta;
use App\Entity\Post\Post;

/**
 * Class BlogFixture
 * @package Db\Fixtures
 */
class BlogFixture implements FixtureInterface
{
    public function load(ObjectManager $manager): void
    {
        $faker = Factory::create();

        for ($i = 0; $i < 50; $i++) {
            $post = new Post(
                DateTimeImmutable::createFromMutable($faker->dateTime),
                trim($faker->sentence, '.'),
                new Content($faker->text(500), $faker->paragraphs(5, true)),
                new Meta(trim($faker->sentence, '.'), $faker->text())
            );

            try {

                $count = random_int(0, 10);

                for ($j = 0; $j < $count; $j++) {
                    $post->addComment(
                        DateTimeImmutable::createFromMutable($faker->dateTime),
                        $faker->name,
                        $faker->text()
                    );
                }

                $manager->persist($post);

            } catch (Exception $e) {
            }
        }

        $manager->flush();
    }
}
