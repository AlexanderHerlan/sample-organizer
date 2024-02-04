# sample-organizer
Python based windows GUI for organizing a collection of music production audio files, like loops, one shot, stems, etc.

Known issues:
https://stackoverflow.com/questions/77232001/python-eel-module-unable-to-use-import-bottle-ext-websocket-as-wbs-modulenotfoun

after you configure your pipenv for this project on python 3.12, you may unfortunately encounter this error:
```
Traceback (most recent call last):
  File "D:\Drive\Dev\python\projects\sample-organizer\src\main.py", line 7, in <module>
    import eel
  File "C:\Users\alexw\.virtualenvs\sample-organizer-zhTLgp1A\Lib\site-packages\eel\__init__.py", line 16, in <module>
    import bottle.ext.websocket as wbs
ModuleNotFoundError: No module named 'bottle.ext.websocket'
```
I have tried the first workaround described in the stackoverflow above, but unfortunately it did not work.

I had to manually go into my projects virtualenv folder, and modify the Lib\site-packages\eel\__init__.py file as described.

replacing `import bottle.ext.websocket as wbs` with `import bottle_websocket as wbs`

I will update the project notes if this is ever properly fixed. 