<?php
/**
* @noinspection UnknownInspectionInspection
* @noinspection DuplicatedCode
* @noinspection PhpUnused
*/

declare(strict_types=1);

namespace App\VkApi;

use Throwable;

/**
* Class APIPhotos
* @package App\VkApi
*/
class APIPhotos extends API
{
    private const

        GET         = '/photos.get',
        GETALL      = '/photos.getAll',
        ALBUMS      = '/photos.getAlbums',
        SERVER      = '/photos.getUploadServer',
        MSGSERVER   = '/photos.getMessagesUploadServer',
        COVERSERVER = '/photos.getOwnerCoverPhotoUploadServer',
        WALLSERVER  = '/photos.getWallUploadServer',
        CREATE      = '/photos.createAlbum',
        SAVECOVER   = '/photos.saveOwnerCoverPhoto',
        SAVEMSG     = '/photos.saveMessagesPhoto',
        SAVEWALL    = '/photos.saveWallPhoto',
        SAVE        = '/photos.save';

    /**
     * @param int $owner_id
     * @param $album_id
     * @param int $gcp
     * @param int $extended
     * @param int $rev
     * @param int $photo_sizes
     * @return array
     * @noinspection PhpUnusedParameterInspection
     */
    public function get(int $owner_id, $album_id, int $gcp = PHP_INT_MAX, int $extended = 0, int $rev = 0, int $photo_sizes = 1): array
    {
        $all = $count = 1000;
        $offset = 0;
        $list = [];
        $flag = 0;

        do {

            try {

                $offset += $flag * $count;
                $query = new Execute(self::GET, compact('owner_id','album_id','count','offset','rev','photo_sizes'));

                if ($all > $offset + $count) {
                    $offset = $query->dynamic($all);
                }

                $ret = $this->api(...$query->getCode());
                $all = $ret[0]['count'];

                if ($all > $gcp) {
                    $all = $gcp;
                }

                $list[] = array_merge(...array_column($ret, 'items'));

            } catch (Throwable $e) {
            }

            $flag = 1;

        } while ($all > $offset + $count);

        return count($list) > 0 ? array_merge(...$list) : [];
    }

    /**
     * @param int $owner_id
     * @param int $offset
     * @param int|null $count
     * @param int $need_covers
     * @param int $need_system
     * @return array
     * @throws RejectInterface
     */
    public function getAlbums(int $owner_id, int $offset = 0, int $count = null, int $need_covers = 1, int $need_system = 0): array
    {
        return $this->api(self::ALBUMS, compact('owner_id','offset','count','need_covers','need_system'));
    }

    /**
     * @param int $owner_id
     * @param int $gcp
     * @param int $extended
     * @param int $photo_sizes
     * @return array
     */
    public function getAll(int $owner_id, int $gcp = PHP_INT_MAX, int $extended = 0, int $photo_sizes = 0): array
    {
        $all = $count = 200;
        $offset = 0;
        $list = [];
        $flag = 0;

        do {

            try {

                $offset += $flag * $count;
                $query = new Execute(self::GETALL, compact('owner_id','extended','offset','count','photo_sizes'));

                if ($all > $offset + $count) {
                    $offset = $query->dynamic($all);
                }

                $ret = $this->api(...$query->getCode());
                $all = $ret[0]['count'];

                if ($all > $gcp) {
                    $all = $gcp;
                }

                $list[] = array_merge(...array_column($ret, 'items'));

            } catch (Throwable $e) {
            }

            $flag = 1;

        } while ($all > $offset + $count);

        return count($list) > 0 ? array_merge(...$list) : [];
    }

    /**
     * @param string|null $access_token
     * @return array
     * @throws RejectInterface
     */
    public function getMessagesUploadServer(/* int $peer_id = null, */ string $access_token = null): array
    {
        return $this->api(self::MSGSERVER, compact(/*'peer_id',*/ 'access_token'));
    }

    /**
     * @param int $group_id
     * @param int $crop_x
     * @param int $crop_y
     * @param int $crop_x2
     * @param int $crop_y2
     * @param string|null $access_token
     * @return array
     * @throws RejectInterface
     */
    public function getOwnerCoverPhotoUploadServer(int $group_id, int $crop_x, int $crop_y, int $crop_x2, int $crop_y2, string $access_token = ''): array
    {
        return $this->api(self::COVERSERVER, compact('group_id','crop_x','crop_y','crop_x2','crop_y2','access_token'));
    }

    /**
     * @param int $group_id
     * @return array
     * @throws RejectInterface
     */
    public function getWallUploadServer(int $group_id): array
    {
        $group_id = (int) abs($group_id);

        return $this->api(self::WALLSERVER, compact('group_id'));
    }

    /**
     * @param int $album_id
     * @param int|null $group_id
     * @param string|null $access_token
     * @return array
     * @throws RejectInterface
     */
    public function getUploadServer(int $album_id, int $group_id = null, string $access_token = null): array
    {
        if (is_int($group_id)) {
            $group_id = (int) abs($group_id);
        }

        return $this->api(self::SERVER, compact('album_id','group_id','access_token'));
    }

    /**
     * @param int $server
     * @param string $photo
     * @param string $hash
     * @param string|null $access_token
     * @return array
     * @throws RejectInterface
     */
    public function saveMessagesPhoto(int $server, string $photo, string $hash, string $access_token = null): array
    {
        return $this->api(self::SAVEMSG, compact('server','photo','hash','access_token'));
    }

    /**
     * @param string $hash
     * @param string $photo
     * @param string|null $access_token
     * @return array
     * @throws RejectInterface
     */
    public function saveOwnerCoverPhoto(string $hash, string $photo, string $access_token = null): array
    {
        return $this->api(self::SAVECOVER, compact('hash','photo','access_token'));
    }

    /**
     * @param int $id
     * @param array $upload
     * @param string $caption
     * @return array
     * @throws RejectInterface
     */
    public function saveWallPhoto(int $id, array $upload, string $caption = ''): array
    {
        $key = $id !== abs($id) ? 'group_id' : 'user_id';
        $upload[$key] = abs($id);
        $upload['caption'] = $caption;

        return $this->api(self::SAVEWALL, $upload);
    }

    /**
     * @param array $upload
     * @param string|null $access_token
     * @return array
     * @throws RejectInterface
     */
    public function save(array $upload, string $access_token = null): array
    {
        $params = compact('access_token');
        $params['album_id'] = $upload['aid'];

        if (isset($upload['gid'])) {
            $params['group_id'] = $upload['gid'];
        }

        $params = array_merge($params, $upload);
        return $this->api(self::SAVE, $params);
    }

    /**
     * @param string $title
     * @param string $description
     * @param int|null $group_id
     * @param string $privacy_view
     * @param int $upload_by_admins_only
     * @return array
     * @throws RejectInterface
     */
    public function createAlbum(
        string $title,
        string $description = '',
        int $group_id = null,
        string $privacy_view = 'nobody / only_me',
        int $upload_by_admins_only = 0
    ): array {

        if (is_int($group_id)) {
            $group_id = (int) abs($group_id);
        }

        return $this->api(
            self::CREATE,
            compact('title','description','group_id','privacy_view','upload_by_admins_only')
        );
    }
}
