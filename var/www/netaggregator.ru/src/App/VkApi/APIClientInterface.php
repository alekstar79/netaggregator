<?php declare(strict_types=1);

namespace App\VkApi;

/**
* Interface APIClientInterface
* @package App\VkApi
*
* @property TransportInterface http
* @property APIStreaming streaming
* @property APIMessages messages
* @property APIAccount account
* @property APIFriends friends
* @property APIGroups groups
* @property APIPhotos photos
* @property APILikes likes
* @property APIVideo video
* @property APIUsers users
* @property APIWall wall
*/
interface APIClientInterface extends TransportInterface
{
    public const

        STREAMING   = APIStreaming::class,
        MESSAGES    = APIMessages::class,
        ACCOUNT     = APIAccount::class,
        FRIENDS     = APIFriends::class,
        GROUPS      = APIGroups::class,
        PHOTOS      = APIPhotos::class,
        LIKES       = APILikes::class,
        VIDEO       = APIVideo::class,
        USERS       = APIUsers::class,
        WALL        = APIWall::class;

    public function setCurrentTokens(int $req);

    public function nextToken(): string;

    public function streaming(): APIStreaming;

    public function messages(): APIMessages;

    public function account(): APIAccount;

    public function friends(): APIFriends;

    public function groups(): APIGroups;

    public function photos(): APIPhotos;

    public function likes(): APILikes;

    public function video(): APIVideo;

    public function users(): APIUsers;

    public function wall(): APIWall;
}
