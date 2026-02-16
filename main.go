package main

import (
	"embed"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
)

var assets embed.FS

func main() {

	app := NewApp()

	err := wails.Run(&options.App{
		Title:     "TODO",
		Width:     1000,
		Height:    700,
		Assets:    assets,
		OnStartup: app.startup,
		Bind: []interface{}{
			app,
		},
	})

	if err != nil {
		println(err.Error())
	}
}
