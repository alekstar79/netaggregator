<?php declare(strict_types=1);

namespace App\Model;

use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\EntityRepository;

use InvalidArgumentException;

/**
* Class EMStoreLayer
* @package App\Model
*/
abstract class EMStoreLayer
{
    /** @var EntityManagerInterface */
    protected EntityManagerInterface $em;

    /** @var EntityRepository */
    protected $repository;

    /** @var string */
    protected string $entity;

    public function __construct(string $entity, EntityManagerInterface $em)
    {
        $this->repository = $em->getRepository($entity);
        $this->entity = $entity;
        $this->em = $em;
    }

    private function supportsClass($object): bool
    {
        return $object instanceof $this->entity || is_subclass_of($object, $this->entity);
    }

    public function save($object, bool $flush = false)
    {
        if (!$this->supportsClass($object)) {
            throw new InvalidArgumentException('Invalid entity passed to this manager');
        }

        $this->em->persist($object);

        if ($flush === true) {
            $this->flush();
        }

        return $object;
    }

    public function delete($object, bool $flush = false): bool
    {
        if (!$this->supportsClass($object)) {
            throw new InvalidArgumentException('Invalid entity passed to this manager');
        }

        $this->em->remove($object);

        if ($flush === true) {
            $this->flush();
        }

        return true;
    }

    /**
     * Providing access to the entity manager flush method
     */
    public function flush(): void
    {
        $this->em->flush();
    }
}
