from mmo_project.main import main

def test_main(capsys):
    main()
    captured = capsys.readouterr()
    assert "Hello, MMO!" in captured.out
