# Работа с датой и временем в PHP

В этом уроке мы поговорим о том, как работать с датой и временем в PHP. Часто в задачах нужно производить какие-то вычисления, связанные со временем, например «определить, какой день недели был 12 февраля 1956 года» или «найти дату на 3 дня позже, чем 26 февраля 2012 года». В общем, нужен виртуальный календарь. Не стоит спешить открывать редактор и писать очередной велосипед для работы с датами, лучше посмотрим, какие возможности уже встроены в PHP.

В PHP есть 2 основных способа представления даты/времени: 

- в виде unix timestamp, числа секунд, прошедших с 1 января 1970 года
- в виде объекта \DateTime или \DateTimeImmutable

Также, важно помнить, что местное время в разных точках мира разное - в один и тот же момент времени в США может быть ночь, а в Европе - день. Потому, чтобы задать время, важно еще знать [*временную зону*](https://ru.wikipedia.org/wiki/%D0%A7%D0%B0%D1%81%D0%BE%D0%B2%D0%BE%D0%B9_%D0%BF%D0%BE%D1%8F%D1%81) или часовой пояс, к которое оно относится. В первом случае время хранится в [UTC](https://ru.wikipedia.org/wiki/%D0%92%D1%81%D0%B5%D0%BC%D0%B8%D1%80%D0%BD%D0%BE%D0%B5_%D0%BA%D0%BE%D0%BE%D1%80%D0%B4%D0%B8%D0%BD%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%BD%D0%BE%D0%B5_%D0%B2%D1%80%D0%B5%D0%BC%D1%8F), во втором - временная зона либо задается при создании объекта, либо используется заданная в php.ini зона по умолчанию. 

Чтобы PHP знал, в каком часовом поясе находится сервер и какое время считается "местным", нужно задать опцию [date.timezone](http://php.net/manual/ru/datetime.configuration.php#ini.date.timezone) в php.ini. Например, для Москвы стоит написать:

    date.timezone=Europe/Moscow

В мануале приведен [полный список поддерживаемых часовых поясов](http://php.net/manual/ru/timezones.php).

## Unix timestamp

В PHP функции работы со временем используют формат unix timestamp (unix time, POSIX time, таймстамп, временная метка). Таймстамп — это число секунд, которое прошло с 00:00 1 января 1970 года. Поскольку секунд с той поры прошло много, таймстампы получаются довольно большие. Например, времени «12:00:00 5 января 2012 года» соответствует число 1380413489. Для дат до 1970-го года используют отрицательные числа.

unix timestamp хранится в временной зоне UTC (примерно соответствует времени в Лондоне). 

Получить время в виде timestamp можно несколькими способами:

- Функция `time()` возвращает текущее время в виде timestamp с точностью до секунды
- Функция `mktime()` возвращет таймстамп для указанных значений часа, минут, секунд, месяца, дня и года (именно в таком порядке: сначала номер месяца, потом день). Например `echo mktime(12, 0, 0, 1, 5, 2012);` выведет метку времени для 12:00:00 5 января 2012 в зоне UTC
- Функция `strtotime` парсит время из строки в формате вроде '2012-01-05 12:00:00' и возвращает timestamp. Она умеет разбирать дату в большом количестве форматов, [подробный список](http://php.net/manual/ru/datetime.formats.php) которых можно найти в мануале по этой функции. По умолчанию время воспринимается как местное (в часовом поясе, заданном в настройках PHP), если только часовой пояс не указан явно (например, в виде `12:00:00+04:00`).

Иногда точности функции `time()` недостаточно. Например, для подсчета времени выполнения функции, которая выполнялась меньше одной секунды. В таких случаях можно использовать функцию `microtime` , которая возвращает время с высокой точностью, в виде дробного числа секунд. Обратите внимание, ее надо писать, указывая `true` в скобках: `microtime(true)` (почему? ответ в мануале). Вот пример измерения, сколько времени выполнялся цикл: 

```php
$start = microtime(true);
$a = 0;
for ($i = 0; $i < 1000000; $i++) {
    $a = $a + 2;
}
$end = microtime(true);
// находим разницу и переводим из секунд в миллисекунды
$timeMilliseconds = ($end - $start) * 1000; 
echo "Время выполнения: $timeMilliseconds мс\n";
```

Преобразовать дату из timestamp обратно в понятный человеку вид можно функцией `date` . Она выводит ее в указанном формате (что обозначают буковки в описании формата, написано в мануале):

```php
$time = strtotime('2012-03-12 15:00:00');
echo "Timestamp: $time\n";
echo "Дата: " . date('Y.m.d H:i:s', $time)."\n";
echo "Еще дата: " . date('r', $time) . "\n";
```

Посмотреть в действии: http://ideone.com/SvvG0f. Еще с помощью функции `date` легко получить, какому дню недели соответствует дата: `echo date('N', $time);`.

Также, в PHP есть функция для проверки правильности даты. Допустим, пользователь ввел дату рождения и мы хотим проверить, а не ввел ли он случайно 31 февраля или 37 октября? Для этого можно воспользоваться функцией `checkdate` , которая проверяет, существуют ли указанные день, месяц и год.

### Сложение и вычитание дат

Теперь разберемся, как найти дату, например, «на 3 дня позже заданной». Если пытаться вручную складывать дни, учитывать сколько дней в разных месяцах, это может затянуться надолго, а вот с timestamp все становится проще. 3 суток содержат 3 \* 24 = 72 часа, каждый час 3600 секунд. Если мы теперь к исходной timestamp прибавим 3 \* 24 \* 3600, то мы получим timestamp даты на 3 дня позже. Осталось только вывести эту дату:

```php
$time = strtotime('2012-02-26'); // Исходная дата
$interval = 3 * 24 * 3600; // число секунд в 3 сутках
$time += $interval;
echo "Через 3 дня будет " .date('Y-m-d', $time) ."\n";
```

Посмотреть в действии: http://ideone.com/ObaCYI

## ООП-версия

Работать с датами можно и с помощью объектов — для этого в PHP есть классы `DateTime` и `DateTimeImmutable` (второй отличается тем, что его объект нельзя изменять после создания), объединенные интерфейсом `DateTimeInterface`. Все подробности о них можно прочесть в мануале. Преимущества объекта: 

- можно задать часовой пояс при создании, а также преобразовывать даты между разными часовыми поясами (метод `setTimezone()`). 
- они позволяет работать с огромными датами, которые не помещаются в обычный timestamp (на 32-битных машинах числа типа int могут быть только от -2 млрд. до +2 млрд., и они позволяет без потерь точности поддерживать даты только от 1900 до 2038 года, если нужно больше, используйте `DateTime`).
- ну и наконец, любителям ООП он понравится больше

Недостатки: для простых случаев кода получается больше, чем с `mkdate`/`strtotime`.

## Задачи

Ну что, с таким багажом ценных знаний вам совсем не составит труда решить эти задачи:

1 . Сделайте программу, определяющую по дате рождения день недели и знак Зодиака. Например, указываем дату «1999-06-25», она пишет «Вы родились 25 июня 1999 в пятницу, значит вы Рак». Соответствие между датой и знаком Зодиака легко найти в википедии: http://ru.wikipedia.org/wiki/Знаки_зодиака.

Слишком просто? Вот задача посложнее.

2 . Дана дата из 2012 года, например, «2012-04-15». Посчитайте дату, которая наступает через 5 рабочих дней после нее. «5 рабочих дней» значит, что в этот интервал не включаются выходные и праздники. Выходные — это субботы и воскресенья (кроме тех, что были превращены в рабочие дни), а список праздников легко найти в интернете: http://www.legalcalc.ru/date-calculator/nerabochie-dni-2012.htm.
