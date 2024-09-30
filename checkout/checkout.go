package main

import (
	"fmt"
	"io"
	"net/http"
	"time"
	"github.com/Bruno07/bbooking/checkout/queue"
	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

type Order struct {
	Uuid         string    `json:"uuid"`
	Name         string    `json:"name"`
	Phone        string    `json:"phone"`
	Email        string    `json:"email"`
	PostalCode   string    `json:"postal_code"`
	Number       string    `json:"number"`
	Address      string    `json:"address"`
	Neighborhood string    `json:"neighborhood"`
	Town         string    `json:"town"`
	State        string    `json:"state"`
	BookID       string    `json:"book_id"`
	Status       string    `json:"status"`
	CreatedAt    time.Time `json:"created_at,string"`
}

func main() {
	r := mux.NewRouter()

	r.Use(auth.AuthMiddleware)

	r.HandleFunc("/checkout", postCheckout).Methods(http.MethodPost)

	// Configuração de CORS
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE"},
		AllowedHeaders:   []string{"Authorization", "Content-Type"},
		AllowCredentials: true,
	})

	handler := c.Handler(r)

	http.ListenAndServe(":5001", handler)
}

func postCheckout(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		panic(err.Error())
	}

	fmt.Println(string(body))

	connection := queue.Connect()
	queue.Notify(body, "checkout_ex", "", connection)
}
