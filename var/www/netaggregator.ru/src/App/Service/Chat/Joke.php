<?php declare(strict_types=1);

namespace App\Service\Chat;

/**
* Class Joke
* @package App\Service\Chat
*/
class Joke
{
    public static function get(): string
    {
        return self::LIST[array_rand(self::LIST)];
    }

    private const LIST = [
        <<<EOT
Приходит маленький индеец к вождю племени и спрашивает:
- Скажи мне вождь, это ты всем в племени имена придумываешь
- Да малыш.
- А как ты их придумываешь?
- Очень просто:
в момент рождения твоей мамы я увидел бегущую рысь,
её и назвали Бегушая Рысь,
а в момент рождения твоего папы я видел в небе орла
и папу назвали Летящий Орел.
А почему ты спрашиваешь Две Ебущиеся Собаки?
EOT
        , <<<EOT
За подопытными кроликами не уследишь:
чуть отвлекся, у них сразу какие-то шорохи, поворачиваешься
- они уже лежат, курят...
EOT
        , <<<EOT
Хорошо подумав, профессор психологии Иван Дмитриевич,
понял, что во фразе: “хотелось бы понять женщину”,
предпоследнее слово лишнее.
EOT
        , <<<EOT
Встречаются две подруги.
- Ну где отдохнула?
- Под Владимиром?
- Ну и как?
- Ничего, хороший парень!
EOT
        , <<<EOT
Строгий отец дочери:
- Маша, вчера я видел, как ты занималась любовью в машине с молодым человеком. Кто он такой?
- А какого цвета был автомобиль?
EOT
        , <<<EOT
Подруги делятся, как прошло 8 марта с возлюбленными.
Первая: Это было ужасно! Представляешь, повел к себе домой, сразу в постель, через 5 минут кончил и уснул. Ну кошмар!
Вторая: Ой, а у меня все было как во сне! Пошли в ресторан, пили изумительное вино.
Поехали к нему, два часа предварительных ласк, час сам секс, а потом еще целый час разговаривали обо всем!
Супер!

В это же время встречаются на другом конце города два мужика.
- Классный был вечерок! Сразу поехали ко мне, мозги не компостировала, потрахались, я заснул, выспался, настроение отличное!
- А у меня какой-то ужас. Пришлось тащиться в ресторан - там официант, блин, принес самое дорогое вино.
Неудобно, пришлось взять. Пришли домой - у меня два часа не вставал, час не мог кончить, потом час не мог заснуть...
EOT
        , <<<EOT
Председатель колхоза вызывает доярку:
- Мне позвонили, что завтра приедут из центра интервью у тебя брать.
- А что это такое?
- Точно не знаю, но на всякий случай подмойся.
EOT
        , <<<EOT
Монахиня на исповеди:
- Святой отец, вчера за мной увязался мужик. Было темно, и я пошла быстрее.
Мужик тоже пошел быстрее. Это же логично?
- Мм… логично.
- Я свернула в сторону, мужик свернул за мной. Это же логично?
- Мм… логично.
- Я остановилась и задрала юбку, а он спустил брюки. Это же логично?
- Мм… логично, ну а дальше что?
- А то, что женщина с задранной юбкой бегает быстрей мужика со спущенными штанами.
EOT
        , <<<EOT
Пошел мужик на охоту, смотрит на болоте селезень сидит.
Он прицелился, но решил ближе подойти.
Подкрался, прицелился, решил еще ближе подойти.
И так несколько раз, а тот сидит не шелохнется.
Он, офигевший, подошел вплотную.
Селезень: Тсс! Карась!!!
Мужик: Что, клюет?!
-Нет, сосет...
EOT
        , <<<EOT
У Лермантова был билет на бал. Он говорит Пушкину:
- Давай я пройду на бал, потом пойду в туалет, открою там окно и ты пролезешь.
На том и порешили. Пришел Лермантов на бал, познакомили его с дамой, он ее пригласил на танец.
Танцуют. Лермантов извиняется перед дамой, выходит справить нужду.
Справил, открыл окно и вышел из туалета, а ширинку закрыть забыл.
Возвратился к даме. Танцуют. А ей неловко, что он не застегнулся,
она и говорит:
- Извините, М.Ю., но вы кажется свое окно не закрыли...
- Да, я знаю. Сейчас оттуда вылезет мой кудрявый друг.
EOT
        , <<<EOT
Жалуется жена к психологу, что её муж всех называет ПЕДЕРАСТАМИ,
психолог говорит: Приводите его ко мне разберёмся!

Приходит к нему муж, психолог его спрашивает: В чём ваша проблема?

Муж: Да знаете, я думаю что все ПЕДЕРАСТЫ!
Психолог: А почему?
Муж: Не знаю, просто все педерасты...
Психолог: Ну ладно, сейчас мы проведём не большой тестик!

Показывает ему картину (три мужика на привале), и спрашивает - что вы думаете об этой картине?

Муж: Все ПЕДЕРАСТЫ!
Психолог: а почему?
Муж: Нууу... потому что все мужики и не одной БАБЫ!
Психолог: Ладно, показывает ему другую картину (касяк уток), а что вы думаете об этой картине?
Муж: Все ПЕДЕРАСТЫ!
Психолог: А почему?
Муж: Потому что они летят и смотрят друг другу в ЖОПУ!
Психолог: Ладно! А что вы думаете обо мне?
Муж: И ты ПЕДЕРАСТ!!!
Психолог: А почему?
Муж: А откуда у тебя такие картинки?
EOT
    ];
}