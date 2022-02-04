tell application "Music"
	set pp to playlists
	repeat with p in pp
    log "\n"

    set t to (size of p < 1000000000)

    set playlistName to name of p
    if t and (class of p is user playlist)

      log playlistName & ":"

      repeat with t in tracks of p
        set thePath to ("\"" & POSIX path of (get location of t) & "\"")
        log " - " & thePath
      end repeat
    end if


	end repeat

end tell
