<?php
/**
* @noinspection UnknownInspectionInspection
* @noinspection PhpUnused
*/

declare(strict_types=1);

namespace App\Service\Research;

/**
 * Class Audio
 * @package App\Service\Research
 */
class Audio
{
	/** @var array */
	private array $config;

	/** @var Requests */
	public Requests $api;

    /**
     * Constructor
     * @param array $config
     */
	public function __construct(array $config)
    {
		$this->api = Requests::create($config);
        $this->config = $config;
	}

	/**
	 * audio.get
	 * @param array $params Parameters
	 * @return array
	 */
	public function get(array $params = []): array
    {
		if (!isset($params['owner_id'])) {
            $params['owner_id'] = $this->config['api_id'];
        }
		if (!isset($params['count'])) {
            $params['count'] = 25;
        }

		return $this->request('audio.get', $params);
	}

	/**
	 * audio.add
	 * @param int $audio_id Audio ID
	 * @param int $owner_id Owner ID
	 * @param array $params Parameters
	 * @return array
	 */
	public function add(int $audio_id, int $owner_id, array $params = []): array
    {
		$params['audio_id'] = $audio_id;
		$params['owner_id'] = $owner_id;

		return $this->request('audio.add', $params);
	}

	/**
	 * audio.addPlaylist
	 * @param string $title Playlist title
	 * @param array $params Parameters
	 * @return array
	 */
	public function addPlaylist(string $title, array $params = []): array
    {
		$params['title'] = $title;

		return $this->request('audio.addPlaylist', $params);
	}

	/**
	 * audio.delete
	 * @param int $audio_id Audio ID
	 * @param int $owner_id Owner ID
	 * @param array $params Parameters
	 * @return array
	 */
	public function delete(int $audio_id, int $owner_id, array $params = []): array
    {
		$params['audio_id'] = $audio_id;
		$params['owner_id'] = $owner_id;

		return $this->request('audio.delete', $params);
	}

	/**
	 * audio.deletePlaylist
	 * @param int $owner_id Owner ID
	 * @param int $playlist_id Playlist ID
	 * @param array $params Parameters
	 * @return array
	 */
	public function deletePlaylist(int $owner_id, int $playlist_id, array $params = []): array
    {
		$params['owner_id'] = $owner_id;
		$params['playlist_id'] = $playlist_id;

		return $this->request('audio.deletePlaylist', $params);
	}

	/**
	 * audio.edit
	 * @param int $owner_id Owner ID
	 * @param int $audio_id Audio ID
	 * @param array $params Parameters
	 * @return array
	 */
	public function edit(int $owner_id, int $audio_id, array $params = []): array
    {
		$params['owner_id'] = $owner_id;
		$params['audio_id'] = $audio_id;

		return $this->request('audio.edit', $params);
	}

	/**
	 * audio.editPlaylist
	 * @param int $owner_id Owner ID
	 * @param int $playlist_id Playlist ID
	 * @param array $params Parameters
	 * @return array
	 */
	public function editPlaylist(int $owner_id, int $playlist_id, array $params = []): array
    {
		$params['owner_id'] = $owner_id;
		$params['playlist_id'] = $playlist_id;

		return $this->request('audio.editPlaylist', $params);
	}

	/**
	 * audio.getPlaylists
	 * @param array $params Parameters
	 * @return array
	 */
	public function getPlaylists(array $params = []): array
    {
		if (!isset($params['owner_id'])) {
            $params['owner_id'] = $this->config['api_id'];
        }
		if (!isset($params['count'])) {
            $params['count'] = 50;
        }

		return $this->request('audio.getPlaylists', $params);
	}

	/**
	 * audio.getBroadcastList
	 * @param array $params Parameters
	 * @return array
	 */
	public function getBroadcastList(array $params = []): array
    {
		if (!isset($params['filter'])) {
            $params['filter'] = 'all';
        }

		return $this->request('audio.getBroadcastList', $params);
	}

	/**
	 * audio.getById
	 * @param array $audios Audio IDs list
	 * @param array $params Parameters
	 * @return array
	 */
	public function getById(array $audios, array $params = []): array
    {
		$params['audios'] = implode(',', $audios);

		return $this->request('audio.getById', $params);
	}

	/**
	 * audio.getCount
	 * @param int $owner_id Owner ID
	 * @param array $params Parameters
	 * @return array
	 */
	public function getCount(int $owner_id, array $params = []): array
    {
		$params['owner_id'] = $owner_id;

		return $this->request('audio.getCount', $params);
	}

	/**
	 * audio.getLyrics
	 * @param int $lyrics_id Lyrics ID from audio object
	 * @param array $params Parameters
	 * @return array
	 */
	public function getLyrics(int $lyrics_id, array $params = []): array
    {
		$params['lyrics_id'] = $lyrics_id;

		return $this->request('audio.getLyrics', $params);
	}

	/**
	 * audio.getPopular
	 * @param array $params Parameters
	 * @return array
	 */
	public function getPopular(array $params = []): array
    {
		if (!isset($params['count'])) {
            $params['count'] = 100;
        }

		return $this->request('audio.getPopular', $params);
	}

	/**
	 * audio.getRecommendations
	 * @param array $params Parameters
	 * @return array
	 */
	public function getRecommendations(array $params = []): array
    {
		if (!isset($params['count'])) {
            $params['count'] = 100;
        }

		return $this->request('audio.getRecommendations', $params);
	}

	/**
	 * audio.getUploadServer
	 * @param array $params Parameters
	 * @return array
	 */
	public function getUploadServer(array $params = []): array
    {
	    return $this->request('audio.getUploadServer', $params);
	}

	/**
	 * audio.addToPlaylist
	 * @param int $owner_id Owner ID
	 * @param array $audio_ids Audio IDs in `{owner_id}_{audio_id}` format
	 * @param array $params Parameters
	 * @return array
	 */
	public function addToPlaylist(int $owner_id, array $audio_ids, array $params = []): array
    {
		$params['owner_id'] = $owner_id;
		$params['audio_ids'] = implode(',', $audio_ids);

		return $this->request('audio.addToPlaylist', $params);
	}

	/**
	 * audio.reorder
	 * @param int $audio_id Audio ID
	 * @param array $params Parameters
	 * @return array
	 */
	public function reorder(int $audio_id, array $params = []): array
    {
		$params['audio_id'] = $audio_id;

		return $this->request('audio.reorder', $params);
	}

	/**
	 * audio.restore
	 * @param int $audio_id
	 * @param array $params Parameters
	 * @return array
	 */
	public function restore(int $audio_id, array $params = []): array
    {
		$params['audio_id'] = $audio_id;

		return $this->request('audio.restore', $params);
	}

	/**
	 * audio.save
	 * @param int $server Field from audio.getUplaodServer
	 * @param string $audio Field from audio.getUploadServer
	 * @param array $params Parameters
	 * @return array
	 */
	public function save(int $server, string $audio, array $params = []): array
    {
		$params['server'] = $server;
		$params['audio'] = $audio;

		return $this->request('audio.save', $params);
	}

	/**
	 * audio.search
	 * @param array $params Parameters
	 * @return array
	 */
	public function search(array $params = []): array
    {
	    return $this->request('audio.search', $params);
	}

	/**
	 * audio.setBroadcast
	 * @param array $params Parameters
	 * @return array
	 */
	public function setBroadcast(array $params = []): array
    {
	    return $this->request('audio.setBroadcast', $params);
	}

	/**
	 * execute.getPlaylist
	 * @param array $params Parameters
	 * @return array
	 */
	public function getPlaylist(array $params = []): array
    {
		if (!isset($params['owner_id'])) {
            $params['owner_id'] = $this->config['api_id'];
        }
		if (!isset($params['need_playlists'])) {
            $params['need_playlists'] = 1;
        }

		return $this->request('execute.getPlaylist', $params);
	}

	/**
	 * execute.getMusicPage
	 * @param array $params Parameters
	 * @return array
	 */
	public function getMusicPage(array $params = []): array
    {
		if (!isset($params['owner_id'])) {
            $params['owner_id'] = $this->config['api_id'];
        }
		if (!isset($params['func_v'])) {
            $params['func_v'] = 3;
        }
		if (!isset($params['need_playlists'])) {
            $params['need_playlists'] = 1;
        }

		return $this->request('execute.getMusicPage', $params);
	}

	/**
	 * audio.getCatalog
	 * @param array $params Parameters
	 * @return array
	 */
	public function getCatalog(array $params = []): array
    {
        return $this->request('audio.getCatalog', $params);
    }

	/**
	 * Get mp3 link from audio object
	 * @param array $audio Audio from audio.get or other method
	 * @return string
	 */
	public function getMp3Link(array $audio): string
    {
		$url = $audio['url'];

		if (mb_strpos($url, 'https://cs') === 0 &&
            stripos($url, '/audios/') === false &&
            preg_match('/https:\/\/(.*)\/(.*)\/(.*)\/index\.m3u8\?extra=(.*)/i', $url, $m)
        ) {
            $url = "https://$m[1]/$m[3].mp3?extra=$m[4]";
        } else if (
            mb_strpos($url, 'https://ps') === 0 &&
            stripos($url, '/audios/') !== false &&
            preg_match('/https:\/\/(.*)\/(.*)\/(.*)\/(.*)\/index\.m3u8\?extra=(.*)/i', $url, $m)
        ) {
            $url = "https://$m[1]/$m[3]/$m[4].mp3?extra=$m[5]";
        }

		return $url;
	}

	/**
	 * Request to VK API
	 * @param string $method Method name
	 * @param array $params Method parameters
	 * @return array
	 */
	public function request(string $method, array $params): array
    {
	    return $this->api->call($method, $params);
	}
}
