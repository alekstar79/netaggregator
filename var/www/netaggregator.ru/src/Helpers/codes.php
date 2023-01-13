<?php

declare(strict_types=1);

return [

	//	1xx: Informational (информационные):

	100 => 'Continue',						// («продолжай»)
	101 => 'Switching Protocols',			// («переключение протоколов»)
	102 => 'Processing',					// («идёт обработка»)
	105 => 'Name Not Resolved',				// («не удается преобразовать DNS-адрес сервера»)

	//	2xx: Success (успешно):

	200 => 'OK',							// («хорошо»)
	201 => 'Created',						// («создано»)
	202 => 'Accepted',						// («принято»)
	203 => 'Non-Authoritative Information',	// («информация не авторитетна»)
	204 => 'No Content',					// («нет содержимого»)
	205 => 'Reset Content',					// («сбросить содержимое»)
	206 => 'Partial Content',				// («частичное содержимое»)
	207 => 'Multi-Status',					// («многостатусный»)

	//	3xx: Redirection (перенаправление):

	300 => 'Multiple Choices',				// («множественный выбор»)
	301 => 'Moved Permanently',				// («перемещено навсегда»)
	// 302 => 'Moved Temporarily',			// («перемещено временно»)
	302 => 'Found',						    // («найдено»)
	303 => 'See Other',						// («смотреть другое»)
	304 => 'Not Modified',					// («не изменялось»)
	305 => 'Use Proxy',						// («использовать прокси»)
	307 => 'Temporary Redirect',            // («временное перенаправление»)

	//	4xx: Client Error (ошибка клиента):

	400 => 'Bad Request',					// («неверный запрос»)
	401 => 'Unauthorized',					// («неавторизованный запрос»)
	402 => 'Payment Required',				// («необходима оплата за запрос»)
	403 => 'Forbidden',						// («доступ к ресурсу запрещен»)
	404 => 'Not Found',						// («ресурс не найден»)
	405 => 'Method Not Allowed',			// («метод не поддерживается»)
	406 => 'Not Acceptable',				// («неприемлемый запрос»)
	407 => 'Proxy Authentication Required',	// («требуется идентификация прокси»)
	408 => 'Request Timeout',				// («истекло время ожидания»)
	409 => 'Conflict',						// («конфликт»)
	410 => 'Gone',							// («ресурс недоступен, удалён»)
	411 => 'Length Required',				// («необходимо указать длину»)
	412 => 'Precondition Failed',			// («сбой при обработке предварительного условия»)
	413 => 'Request Entity Too Large',		// («тело запроса превышает допустимый размер»)
	414 => 'Request-URI Too Large',			// («недопустимая длина URI запроса»)
	415 => 'Unsupported Media Type',		// («неподдерживаемый тип данных»)
	416 => 'Requested Range Not Satisfiable',//(«диапазон не может быть обработан»)
	417 => 'Expectation Failed',			// («сбой при ожидании»)
	418 => 'I\'m a teapot',					// («я чайник»)
	422 => 'Unprocessable Entity',			// («необрабатываемый экземпляр»)
	423 => 'Locked',						// («заблокировано»)
	424 => 'Failed Dependency',				// («неверная зависимость»)
	425 => 'Unordered Collection',			// («неупорядоченный набор»)
	426 => 'Upgrade Required',				// («необходимо обновление»)
	428 => 'Precondition Required',			// («необходимо предусловие»)
	429 => 'Too Many Requests',				// («слишком много запросов»)
	431 => 'Request Header Fields Too Large',//(«поля заголовка запроса слишком большие»)
	434 => 'Requested host unavailable',	// («запрашиваемый адрес недоступен»)
	449 => 'Retry With',					// («повторить с»)
	451 => 'Unavailable For Legal Reasons',	// («недоступно по юридическим причинам»)
	456 => 'Unrecoverable Error',			// («некорректируемая ошибка»)

	//	5xx: Server Error (ошибка сервера):

	500 => 'Internal Server Error',			// («внутренняя ошибка сервера»)
	501 => 'Not Implemented',				// («метод не поддерживается»)
	502 => 'Bad Gateway',					// («ошибка шлюза»)
	503 => 'Service Unavailable',			// («служба недоступна»)
	504 => 'Gateway Timeout',				// («шлюз не отвечает»)
	505 => 'HTTP Version Not Supported',	// («версия HTTP не поддерживается»)
	506 => 'Variant Also Negotiates',		// («вариант тоже проводит согласование»)
	507 => 'Insufficient Storage',			// («переполнение хранилища»)
	508 => 'Loop Detected',					// («обнаружена петля»)
	509 => 'Bandwidth Limit Exceeded',		// («исчерпана пропускная ширина канала»)
	510 => 'Not Extended',					// («отсутствуют расширения»)
	511 => 'Network Authentication Required'// («требуется сетевая аутентификация»)
];
